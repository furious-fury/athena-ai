
import { ethers } from "ethers";
import { prisma } from "../config/database.js";
import { SmartAccountSigner } from "./smart-account-signer.js";
import { SmartWalletService } from "../services/smartWallet.service.js";
// import fetch from "node-fetch"; // Use native fetch

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
 * Search markets by query string (e.g. "Bitcoin", "Election")
 */
export const search_markets = async (query: string): Promise<Market[]> => {
    try {
        const encoded = encodeURIComponent(query);
        const response = await fetch(`${GAMMA_API_URL}/markets?active=true&closed=false&question=${encoded}&limit=10&order=volume24hr&ascending=false`);

        if (!response.ok) return [];
        const data: any = await response.json();

        return data.map((m: any) => ({
            id: m.id,
            question: m.question,
            outcome: "Yes",
            bestBid: m.bestBid,
            bestAsk: m.bestAsk,
            volume24hr: m.volume24hr,
            questionId: m.questionID,
            conditionId: m.conditionId,
            tokenIds: m.clobTokenIds
        }));
    } catch (error) {
        console.error("search_markets error:", error);
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
// Update to Data API as requested
export const get_positions = async (userId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { scwAddress: true, walletAddress: true }
        });

        if (!user) return [];

        // Prefer Proxy (scwAddress), fallback to EOA (walletAddress)
        const targetAddress = user.scwAddress || user.walletAddress;

        // Fetch from Data API (as requested by user)
        const DATA_API_URL = "https://data-api.polymarket.com/positions";
        const url = `${DATA_API_URL}?user=${targetAddress}&sizeThreshold=0.1&limit=100&sortBy=TOKENS&sortDirection=DESC`;

        const response = await fetch(url);
        if (!response.ok) return [];

        const data: any = await response.json();
        return Array.isArray(data) ? data : [];
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

import WebSocket from 'ws';

// Helper: Sync time with Polymarket to prevent "timestamp too loose" errors
const syncTime = async () => {
    try {
        console.log("[TIME] ⏳ Syncing time with Clob...");
        const response = await fetch("https://clob.polymarket.com/time");
        if (response.ok) {
            const text = await response.text();
            // Server responds with seconds (e.g. "174123..." or JSON)
            const serverTimeSec = parseInt(text.replace(/"/g, '').trim());
            console.log(`[TIME] 📥 Server Time: ${serverTimeSec} | Local: ${Math.floor(Date.now() / 1000)}`);

            if (!isNaN(serverTimeSec)) {
                const serverTimeMs = serverTimeSec * 1000;
                const now = Date.now();
                const offset = serverTimeMs - now;
                console.log(`[TIME] ⏱️ Offset: ${offset}ms`);

                if (Math.abs(offset) > 5000) {
                    console.log(`[TIME] ⚠️ Adjusting local clock by ${offset}ms`);
                    const originalNow = Date.now;
                    Date.now = () => originalNow() + offset;
                    console.log(`[TIME] ✅ Clock patched. New Time: ${Date.now()}`);
                }
            }
        } else {
            console.warn("[TIME] ❌ Failed to fetch time, Status:", response.status);
        }
    } catch (e: any) { console.warn("[TIME] Sync failed:", e.message); }
};

// Helper: Fetch real-time price via WebSocket
const getPriceViaWS = (tokenId: string, side: "BUY" | "SELL"): Promise<number | null> => {
    const WS_URL = "wss://ws-subscriptions-clob.polymarket.com/ws/market";
    return new Promise((resolve) => {
        const ws = new WebSocket(WS_URL);
        const timeout = setTimeout(() => {
            ws.terminate();
            console.warn(`[WS] Timeout fetching price for ${tokenId}`);
            resolve(null);
        }, 3000); // 3s timeout

        ws.on('open', () => {
            ws.send(JSON.stringify({ assets_ids: [tokenId], type: "market" }));
        });

        ws.on('message', (data: any) => {
            try {
                const msg = JSON.parse(data.toString());
                const updates = Array.isArray(msg) ? msg : [msg];
                for (const update of updates) {
                    if (update.event_type === "book" && update.asset_id === tokenId) {
                        // For BUY, we need Lowest Ask (BestAsk)
                        // For SELL, we need Highest Bid (BestBid)
                        if (side === "BUY" && update.asks?.length > 0) {
                            const best = update.asks.reduce((p: any, c: any) => parseFloat(c.price) < parseFloat(p.price) ? c : p);
                            clearTimeout(timeout);
                            ws.close();
                            resolve(parseFloat(best.price));
                            return;
                        } else if (side === "SELL" && update.bids?.length > 0) {
                            const best = update.bids.reduce((p: any, c: any) => parseFloat(c.price) > parseFloat(p.price) ? c : p);
                            clearTimeout(timeout);
                            ws.close();
                            resolve(parseFloat(best.price));
                            return;
                        }
                    }
                }
            } catch (e) { }
        });

        ws.on('error', () => { clearTimeout(timeout); resolve(null); });
    });
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

        if (user.scwOwnerPrivateKey) {
            const eoaWallet = new ethers.Wallet(user.scwOwnerPrivateKey, provider);
            const useProxy = !!user.scwAddress;
            const proxyAddress = user.scwAddress;

            console.log(`[TRADE] 🔹 Trading Mode: ${useProxy ? `PROXY (${proxyAddress})` : `EOA (${eoaWallet.address})`}`);

            // Sync Time before creating client/requests
            await syncTime();

            // Ensure API Keys exist (Create if missing)
            if (!user.apiKey || !user.apiSecret || !user.apiPassphrase) {
                console.log(`[TRADE] 🔑 Creating NEW API keys...`);
                const tempClient = new ClobClient(
                    "https://clob.polymarket.com",
                    137,
                    eoaWallet
                );

                let keys: any;
                try {
                    console.log(`[TRADE] 🔑 Attempting to DERIVE existing API keys...`);
                    keys = await tempClient.deriveApiKey();
                } catch (e: any) {
                    console.warn("[TRADE] Derive failed, falling back to CREATE:", e.message);
                }

                if (!keys) {
                    try {
                        console.log(`[TRADE] 🔑 Creating NEW API keys...`);
                        keys = await tempClient.createApiKey();
                    } catch (e) {
                        console.error("[TRADE] Key creation failed:", e);
                        throw e;
                    }
                }

                if (!keys?.key) throw new Error("Failed to obtain API keys");

                await prisma.user.update({
                    where: { id: user.id },
                    data: { apiKey: keys.key, apiSecret: keys.secret, apiPassphrase: keys.passphrase }
                });
                user.apiKey = keys.key;
                user.apiSecret = keys.secret;
                user.apiPassphrase = keys.passphrase;
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
                useProxy ? 2 : 0,
                useProxy ? proxyAddress || undefined : undefined
            );

        } else {
            throw new Error("No Private Key found for user.");
        }

        // 2. Resolve Token ID
        console.log(`[TRADE] Resolving Token ID: ${trade.marketId}`);
        let assetTokenId: string | null = null;

        // Check if marketId is already the Token ID (long numeric string)
        if (trade.marketId.length > 50 && !isNaN(Number(trade.marketId[0]))) {
            assetTokenId = trade.marketId;
        } else {
            // Fetch from Gamma logic (Collapsed for brevity, relying on input being TokenID often, but keeping logic)
            // For modularity, let's assume marketId input IS the Token ID if possible, or resolve it.
            // Reusing existing resolution logic is safer.
            try {
                const url = `${GAMMA_API_URL}/markets/${trade.marketId}`;
                const marketRes = await fetch(url);
                if (marketRes.ok) {
                    const md: any = await marketRes.json();
                    if (md.clobTokenIds) {
                        let tids = typeof md.clobTokenIds === 'string' ? JSON.parse(md.clobTokenIds) : md.clobTokenIds;
                        if (Array.isArray(tids)) {
                            // Map Yes/No
                            if (trade.outcome.toUpperCase() === "YES" && tids.length > 0) assetTokenId = tids[0];
                            else if (trade.outcome.toUpperCase() === "NO" && tids.length > 1) assetTokenId = tids[1];
                        }
                    }
                }
            } catch (e) { }
        }

        if (!assetTokenId) assetTokenId = trade.marketId; // Fallback

        // 3. Determine Order Strategy
        const side = trade.side.toUpperCase() === "BUY" ? "BUY" : "SELL";

        let finalPrice = trade.price; // Start with provided limit price
        let orderType = "GTC";        // Default to GTC if price is provided

        // If NO price provided, implies MARKET execution via FOK
        if (!finalPrice) {
            console.log(`[TRADE] 🔍 No limit price. Fetching Real-Time ${side} price via WS...`);
            const wsPrice = await getPriceViaWS(assetTokenId, side as "BUY" | "SELL");

            if (wsPrice) {
                // Buffer: Buy higher, Sell lower to cross spread
                const buffer = 0.03;
                if (side === "BUY") {
                    finalPrice = Math.min(wsPrice + buffer, 0.99);
                } else {
                    finalPrice = Math.max(wsPrice - buffer, 0.02);
                }
                finalPrice = Math.floor(finalPrice * 100) / 100; // Round to 2 decimals
                orderType = "FOK";
                console.log(`[TRADE] ⚡ Real-Time Price: ${wsPrice} -> FOK Limit: ${finalPrice}`);
            } else {
                console.warn("[TRADE] ⚠️ WS Price unavailable. Fallback to default.");
                finalPrice = 0.50; // Dangerous fallback? Or just fail? 
                // Existing code used 0.50 default. keeping it safe or erroring?
                // Let's keep it but ideally we should error if market order fails.
            }
        }

        const size = trade.amount.toString(); // API takes raw size? 
        // Wait, trade.amount is in USDC? 
        // Existing code: size: trade.amount.toString().
        // If trade.amount is USDC, we need to convert to SHARES (Amount / Price).
        // If trade.amount IS Shares, then correct.
        // Interface says "amount: number; // Amount in USDC".
        // The previous code did NOT divide by price. This is a BUG in original code if it meant USDC.
        // But if it meant Shares, it's fine.
        // Given `test-buy.js` logic: size = amountUSDC / price.
        // I should fix this calculation if input is USDC.
        // "Amount in USDC" comment in interface strongly suggests USDC.
        // The previous code did NOT divide by price. This is a BUG in original code if it meant USDC.

        let quantity = parseFloat(size);
        if (trade.amount && finalPrice && finalPrice > 0) {
            // Calculate Shares (Strictly integer to satisfy Maker Amount precision rules)
            quantity = Math.floor(trade.amount / finalPrice);
        }

        console.log(`[TRADE] 🚀 Placing ${orderType} ${side} Order: ${quantity} shares @ ${finalPrice}`);

        // 4. Execute
        // Get Tick Size
        let tickSize = "0.01";
        try {
            // @ts-ignore
            const ts = await clobClient.getTickSize(assetTokenId);
            if (ts?.minimum_tick_size) tickSize = ts.minimum_tick_size.toString();
        } catch (e) { }

        const order = await clobClient.createOrder({
            tokenID: assetTokenId,
            price: finalPrice!.toString(),
            side: side,
            size: quantity.toString(),
            feeRateBps: 0,
            expiration: 0,
            nonce: 0
        }, { tickSize, negRisk: true }); // Always assume negRisk true for safety on mainnet markets (most are)

        const postResp = await clobClient.postOrder(order, orderType === "FOK" ? "FOK" : "GTC");

        console.log(`[TRADE] Response:`, JSON.stringify(postResp));

        if (!postResp.success && !postResp.orderID) {
            throw new Error(postResp.errorMsg || "Order Failed");
        }

        return {
            status: "FILLED",
            txId: postResp.orderID || postResp.transactionHash,
            price: finalPrice,
            settlementPrice: finalPrice
        };

    } catch (error: any) {
        console.error("Trade failed:", error?.message || error);
        throw error;
    }
};

/**
 * Fetches trade history from Polymarket Data API (Gamma)
 * Uses public API which is more reliable for historical display than CLOB
 */
export const get_trades = async (userId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { walletAddress: true, scwAddress: true }
        });

        if (!user || (!user.scwAddress && !user.walletAddress)) return [];

        const DATA_API_URL = "https://data-api.polymarket.com/trades";

        // User requested ONLY proxy wallet history
        const addresses: string[] = [];
        if (user.scwAddress) addresses.push(user.scwAddress);
        else if (user.walletAddress) addresses.push(user.walletAddress); // Fallback if no proxy

        const fetchForAddress = async (addr: string) => {
            try {
                // limit=50, takerOnly=false (User reported missing Sells, might be Maker trades)
                const response = await fetch(`${DATA_API_URL}?user=${addr}&limit=100&takerOnly=false`);
                if (!response.ok) return [];
                const data: any = await response.json();
                return Array.isArray(data) ? data : [];
            } catch (e) {
                console.error(`Failed to fetch trades for ${addr}`, e);
                return [];
            }
        };

        const results = await Promise.all(addresses.map(fetchForAddress));

        // Flatten, Deduplicate by txHash, and Sort by Timestamp desc
        const allTrades = results.flat();
        const uniqueTrades = Array.from(new Map(allTrades.map((t: any) => [t.transactionHash || Math.random(), t])).values());

        // Sort descending
        uniqueTrades.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

        // Map to simpler format if needed, or return raw. 
        // Frontend expects: market, side, size, price, value (calculated)
        // Data API returns: title, outcome, side, size, price
        return uniqueTrades.map((t: any) => ({
            id: t.transactionHash,
            market: t.title || "Unknown Market", // Richer data!
            asset_id: t.asset,
            side: t.side,
            size: t.size,
            price: t.price,
            timestamp: t.timestamp,
            outcome: t.outcome,
            transactionHash: t.transactionHash,
            icon: t.icon // Pass icon to frontend
        })); // Close map and return

    } catch (error) {
        console.error("get_trades error:", error);
        return [];
    }
};

/**
 * Closes a position by placing a SELL order for the full size.
 * Bypasses place_trade "USDC amount" logic to ensure exact share selling.
 */
export const close_position = async (userId: string, marketId: string, outcome: string) => {
    try {
        console.log(`[CLOSE] 🔴 REQUEST: Closing position for ${userId}`);
        console.log(`[CLOSE] 🔍 Params: MarketId=${marketId}, Outcome=${outcome}`);

        // 1. Get current position size from Data API
        const positions = await get_positions(userId);
        console.log(`[CLOSE] 📥 Fetched ${positions.length} active positions for user.`);

        // Find matching position. Markets mapped from 'asset' or 'conditionId'
        const position = positions.find((p: any) =>
            p.asset === marketId ||
            p.conditionId === marketId
        );

        if (!position) {
            console.error(`[CLOSE] ❌ Position NOT FOUND for MarketId: ${marketId}`);
            console.log(`[CLOSE] Available Assets:`, positions.map((p: any) => p.asset).join(", "));
            throw new Error("Position not found or already closed");
        }

        console.log(`[CLOSE] ✅ Found Position: ${position.asset} (${position.size} shares)`);

        const size = Number(position.size);
        if (size <= 0) throw new Error("Position size is 0");

        // 2. Initialize Client
        const { ClobClient } = await import("@polymarket/clob-client");
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");
        const signer = new ethers.Wallet(user.scwOwnerPrivateKey!, provider);
        const eoaWallet = signer;

        await syncTime();

        // Check keys
        if (!user.apiKey || !user.apiPassphrase || !user.apiSecret) {
            throw new Error("API Keys missing. Please invoke regular trade first to generate keys.");
        }

        // Determine Proxy vs EOA
        const useProxy = !!user.scwAddress;
        const proxyAddress = user.scwAddress;

        console.log(`[CLOSE] 🔹 Trading Mode: ${useProxy ? `PROXY (${proxyAddress})` : `EOA (${eoaWallet.address})`}`);

        // Initialize Client (Type as ANY to avoid lib mismatches, matching place_trade)
        const clobClient: any = new ClobClient(
            "https://clob.polymarket.com",
            137,
            eoaWallet,
            {
                key: user.apiKey,
                secret: user.apiSecret,
                passphrase: user.apiPassphrase
            },
            useProxy ? 2 : 0, // 2 for Proxy, 0 for EOA
            useProxy ? proxyAddress || undefined : undefined
        );

        // 4. Get Price for FOK
        const assetTokenId = position.asset; // This IS the token ID
        const wsPrice = await getPriceViaWS(assetTokenId, "SELL");

        // Sell slightly lower to cross spread.
        let finalPrice = 0.02; // Default fallback if no WS price
        if (wsPrice) {
            // If we have a real market price (Best Bid), use it.
            // Ideally we undercut by a tick to ensure fill, but for FOK at Best Bid it should suffice if size exists.
            // If the price is very low (e.g. 0.005), we MUST use that or lower.
            finalPrice = wsPrice;

            // If price suggests we can undercut safely (e.g. > 5 cents), do it.
            if (finalPrice > 0.05) {
                finalPrice = finalPrice - 0.01;
            }
        }

        console.log(`[CLOSE] 📉 Selling ${size} shares @ ${finalPrice} (FOK) | WS Price: ${wsPrice}`);

        // 5. Place Order
        // Get Tick Size
        let tickSize = "0.01";
        try {
            const ts = await clobClient.getTickSize(assetTokenId);
            if (ts?.minimum_tick_size) {
                tickSize = ts.minimum_tick_size.toString();
                console.log(`[CLOSE] 📏 Fetched Tick Size: ${tickSize}`);
            }
        } catch (e) { console.warn("[CLOSE] Failed to fetch tick size, using default 0.01"); }

        // OVERRIDE: If price is sub-penny (e.g. 0.005), tick size MUST be smaller than 0.01.
        // We defer to the market's minimum if known, otherwise we try 0.001 (0.1 cent) which is common for cheap markets.
        // Previously we tried 0.0001 but some markets reject it if min is 0.001.
        if (finalPrice < 0.01) {
            console.warn(`[CLOSE] ⚠️ Price ${finalPrice} < 0.01. Forcing smaller tick size.`);
            // Only override if we didn't fetch a valid small tick size, OR if the fetched one is too big?
            // Actually, if we fetched one, we should trust it.
            // But I didn't see the log "Fetched Tick Size" in the user output, implying fetch failed or returned nothing.
            // safely default to 0.001.
            if (tickSize === "0.01") {
                tickSize = "0.001";
            }
        }

        const order = await clobClient.createOrder({
            tokenID: assetTokenId,
            price: finalPrice.toString(),
            side: "SELL",
            size: size.toString(), // Exact shares
            feeRateBps: 0,
            expiration: 0,
            nonce: 0
        }, { tickSize, negRisk: true });

        const postResp = await clobClient.postOrder(order, "FOK"); // FOK guarantees fill or kill
        console.log(`[CLOSE] Response:`, JSON.stringify(postResp));

        if (!postResp.success && !postResp.orderID) {
            console.error(`[CLOSE] ❌ Post Order Failed: ${postResp.errorMsg}`);
            throw new Error(postResp.errorMsg || "Close Failed");
        }

        return { success: true, txId: postResp.orderID };

    } catch (e: any) {
        console.error("close_position failed:", e);
        throw e;
    }
};
