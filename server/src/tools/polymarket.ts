
import { ethers } from "ethers";
import { prisma } from "../config/database.js";
import { SmartAccountSigner } from "./smart-account-signer.js";
import { SmartWalletService } from "../services/smartWallet.service.js";
import fetch from "node-fetch";

// Export TradeParams as expected by other files
export interface TradeParams {
    userId: string;
    agentId?: string; // Optional context
    marketId: string; // This is the TokenID for order placement 
    outcome: string; // "YES" or "NO"
    side: string;    // "BUY" or "SELL"
    amount: number;  // Amount in USDC
    price?: number;  // Optional limit price
}

export interface Market {
    id: string;
    question: string;
    outcome: string;
    bestBid: number;
    bestAsk: number;
    volume24hr: number;
    questionId: string;
    conditionId: string;
    tokenIds?: string[];
}

const GAMMA_API_URL = "https://gamma-api.polymarket.com";

/**
 * Fetches top active markets from Gamma API
 */
export const get_markets = async (limit: number = 20): Promise<Market[]> => {
    try {
        const response = await fetch(`${GAMMA_API_URL}/markets?active=true&closed=false&limit=${limit}&order=volume24hr&ascending=false`);
        if (!response.ok) throw new Error("Failed to fetch markets");
        const data: any = await response.json();
        return data.map((m: any) => ({
            id: m.id, // Use internal ID (e.g. "570360") for Gamma API lookups
            question: m.question,
            outcome: "Yes",
            bestBid: m.bestBid,
            bestAsk: m.bestAsk,
            volume24hr: m.volume24hr,
            // Tag extra data
            questionId: m.questionID,
            conditionId: m.conditionId,
            tokenIds: m.clobTokenIds
        }));
    } catch (error) {
        console.error("get_markets error:", error);
        return [];
    }
};

/**
 * Fetches active events (with markets nested)
 */
export const get_active_events = async (limit: number = 20) => {
    try {
        const response = await fetch(`${GAMMA_API_URL}/events?active=true&closed=false&limit=${limit}&order=volume24hr&ascending=false`);
        const data: any = await response.json();
        return data; // Return raw events
    } catch (error) {
        console.error("get_active_events error:", error);
        return [];
    }
};

/**
 * Fetches user positions from Gamma API (Real-time)
 */
export const get_positions = async (userId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { scwOwnerPrivateKey: true }
        });

        if (!user || !user.scwOwnerPrivateKey) return [];

        // Derive EOA address
        const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");
        const wallet = new ethers.Wallet(user.scwOwnerPrivateKey, provider);
        const address = wallet.address;

        // Fetch from Gamma
        const response = await fetch(`${GAMMA_API_URL}/positions?user=${address}`);
        if (!response.ok) return [];

        const data: any = await response.json();
        return data;
    } catch (error) {
        console.error("get_positions error:", error);
        return [];
    }
}

/**
 * Gets the USER's real wallet balance (EOA or Proxy) for display.
 */
export const get_balance = async (userId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { scwOwnerPrivateKey: true, scwAddress: true, balance: true }
        });

        if (!user || !user.scwOwnerPrivateKey) return { usdc: "0", pol: "0", address: "" };

        const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");

        // Determine target address (Proxy if available, else EOA)
        let targetAddress = "";

        if (user.scwAddress) {
            targetAddress = user.scwAddress;
        } else {
            const wallet = new ethers.Wallet(user.scwOwnerPrivateKey, provider);
            targetAddress = wallet.address;
        }

        // USDC on Polygon
        // Check BOTH Native and Bridged just in case
        const USDC_NATIVE = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
        const USDC_BRIDGED = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

        const usdcNative = new ethers.Contract(USDC_NATIVE, ["function balanceOf(address) view returns (uint256)"], provider);
        const usdcBridged = new ethers.Contract(USDC_BRIDGED, ["function balanceOf(address) view returns (uint256)"], provider);

        const [polBalance, nativeBal, bridgedBal] = await Promise.all([
            provider.getBalance(targetAddress),
            usdcNative.balanceOf(targetAddress),
            usdcBridged.balanceOf(targetAddress)
        ]);

        // Use total or prefer Native? Polymarket mainly uses Bridged (USDC.e) for now but transitioning?
        // Actually, Clob usually expects Bridged USDC (6 decimals)
        // But the user deposit was NATIVE.
        // We will sum them for display, but note that Clob might only accept one.
        const totalUSDC = nativeBal.add(bridgedBal);

        return {
            usdc: ethers.utils.formatUnits(totalUSDC, 6),
            pol: ethers.utils.formatEther(polBalance),
            address: targetAddress
        };

    } catch (error) {
        console.error("get_balance error:", error);
        return { usdc: "0", pol: "0", address: "" };
    }
};

export const place_trade = async (trade: TradeParams) => {
    // Lazy import to avoid circular dep issues
    const { ClobClient } = await import("@polymarket/clob-client");

    const user = await prisma.user.findUnique({
        where: { id: trade.userId },
    });

    if (!user) throw new Error("User wallet not found");

    console.log(`[REAL TRADE] 📊 Placing trade for ${trade.userId} on market ${trade.marketId}`);

    let clobClient: any;

    try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");

        // 1. Determine Trading Mode (EOA vs Proxy)
        if (user.scwOwnerPrivateKey) {
            const eoaWallet = new ethers.Wallet(user.scwOwnerPrivateKey, provider);

            // Default to Proxy Mode if scwAddress exists, otherwise EOA
            // User provided 0xA93... as their "wallet", which we stored in scwAddress.
            // If scwAddress is set, we treat it as a Proxy (Side 1).
            // NOTE: If it is a Gnosis Safe, it might be Side 2. But standard Polymarket proxy is Side 1.

            const useProxy = !!user.scwAddress;
            const proxyAddress = user.scwAddress;

            console.log(`[TRADE] 🔹 Trading Mode: ${useProxy ? `PROXY (${proxyAddress})` : `EOA (${eoaWallet.address})`}`);

            if (!user.apiKey || !user.apiSecret || !user.apiPassphrase) {
                console.log(`[TRADE] 🔑 API Keys missing for ${trade.userId}. Creating NEW keys...`);
                try {
                    // Create keys for the ACTOR (Proxy or EOA)
                    // If Proxy: we sign with EOA, but specify Proxy address
                    const tempClient = new ClobClient(
                        "https://clob.polymarket.com",
                        137,
                        eoaWallet,
                        undefined,
                        useProxy ? 1 : 0, // 1 = Proxy, 0 = EOA
                        useProxy ? proxyAddress || undefined : undefined
                    );

                    const keys = await tempClient.createApiKey();
                    console.log(`[TRADE] 🔑 CREATED Keys Successfully`);

                    if (!keys || !keys.key || !keys.secret || !keys.passphrase) {
                        throw new Error("Failed to create valid API keys");
                    }

                    const { key, secret, passphrase } = keys;

                    // Save to DB
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { apiKey: key, apiSecret: secret, apiPassphrase: passphrase }
                    });

                    user.apiKey = key;
                    user.apiSecret = secret;
                    user.apiPassphrase = passphrase;
                } catch (derivError: any) {
                    console.error("API Key Creation Failed:", derivError?.message);
                    throw await derivError;
                }
            }

            // Initialize Client
            clobClient = new ClobClient(
                "https://clob.polymarket.com",
                137,
                eoaWallet,
                {
                    key: user.apiKey || "",
                    secret: user.apiSecret || "",
                    passphrase: user.apiPassphrase || ""
                },
                useProxy ? 2 : 0, // 2 = Gnosis Safe (Common), 0 = EOA
                useProxy ? proxyAddress || undefined : undefined
            );

        } else {
            throw new Error("No Private Key found for user.");
        }

        // 2. Resolve Token ID
        console.log(`[TRADE] Resolving Token ID for Market: ${trade.marketId}, Outcome: ${trade.outcome}`);

        let assetTokenId: string | null = null;
        try {
            const url = `${GAMMA_API_URL}/markets/${trade.marketId}`;
            console.log(`[TRADE] Fetching Market Details: ${url}`);
            const marketRes = await fetch(url);

            if (marketRes.ok) {
                const marketData: any = await marketRes.json();

                if (marketData.tokens && Array.isArray(marketData.tokens)) {
                    const tokenObj = marketData.tokens.find((t: any) => t.outcome.toUpperCase() === trade.outcome.toUpperCase());
                    if (tokenObj) {
                        assetTokenId = tokenObj.tokenId;
                        console.log(`[TRADE] ✅ Resolved Token ID: ${assetTokenId} for outcome ${trade.outcome}`);
                    } else {
                        console.warn(`[TRADE] ⚠️ Outcome ${trade.outcome} not found in tokens:`, marketData.tokens);
                    }
                } else if (marketData.clobTokenIds) {
                    // Fallback
                    console.log(`[TRADE] Using clobTokenIds fallback.`);
                    let tokenIds = marketData.clobTokenIds;

                    // JSON Parse if it's a string representation of an array
                    if (typeof tokenIds === 'string') {
                        try {
                            tokenIds = JSON.parse(tokenIds);
                        } catch (e) {
                            console.error("[TRADE] Failed to parse clobTokenIds:", e);
                        }
                    }

                    if (Array.isArray(tokenIds)) {
                        if (trade.outcome.toUpperCase() === "YES" && tokenIds.length > 0) assetTokenId = tokenIds[0];
                        else if (trade.outcome.toUpperCase() === "NO" && tokenIds.length > 1) assetTokenId = tokenIds[1];
                    }
                }
            } else {
                console.error(`[TRADE] ❌ Gamma API returned ${marketRes.status} ${marketRes.statusText}`);
                const text = await marketRes.text();
                console.error(`[TRADE] Body: ${text}`);
            }
        } catch (resolveErr) {
            console.error("[TRADE] Failed to resolve details from Gamma:", resolveErr);
        }

        if (!assetTokenId) {
            console.warn(`[TRADE] ⚠️ Could not resolve Token ID. Trying original ID: ${trade.marketId}`);
            assetTokenId = trade.marketId;
        }

        // 3. Place Order
        const Side = trade.side.toUpperCase() === "BUY" ? "BUY" : "SELL";
        const price = trade.price || 0.50;

        console.log(`[TRADE] Signed in. Placing order: ${Side} ${trade.amount} USDC of ${assetTokenId} @ ${price}`);

        if (!clobClient) throw new Error("CLOB Client not initialized");

        // DEBUG: Explicitly check tick size accessibility
        let tickSizeOption = "0.01"; // Fallback
        try {
            // @ts-ignore
            const ts = await clobClient.getTickSize(assetTokenId);
            console.log(`[TRADE] Verified Tick Size for ${assetTokenId}:`, ts);
            if (ts && ts.minimum_tick_size) {
                tickSizeOption = ts.minimum_tick_size.toString();
            }
        } catch (tsError: any) {
            console.warn(`[TRADE] ⚠️ Could not fetch tick size manually: ${tsError.message}`);
        }

        const order = await clobClient.createOrder({
            tokenID: assetTokenId,
            price: price.toString(),
            side: Side,
            size: trade.amount.toString(), // LIBRARY EXPECTS 'size', NOT 'quantity'
            feeRateBps: 0,
            nonce: 0
        }, { tickSize: tickSizeOption });

        console.log(`[TRADE] Signed Order created. Posting to CLOB...`);

        const postResp = await clobClient.createAndPostOrder({
            tokenID: assetTokenId,
            price: price.toString(),
            side: Side,
            size: trade.amount.toString(),
            tickSize: tickSizeOption,
            negRisk: false
        });

        console.log(`[TRADE] Post Order Response:`, JSON.stringify(postResp, null, 2));

        if (!postResp.success && !postResp.orderID && !postResp.transactionHash) {
            throw new Error("Trade submission failed: " + (postResp.errorMsg || JSON.stringify(postResp)));
        }

        return {
            status: "FILLED",
            txId: postResp.activeOrder?.orderID || postResp.orderID || postResp.transactionHash || "submitted",
            price: price,
            settlementPrice: price
        };

    } catch (error: any) {
        console.error("Trade failed:", error?.message || error);
        throw error;
    }
};
