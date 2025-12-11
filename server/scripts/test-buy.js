import "dotenv/config";
import { ClobClient } from "@polymarket/clob-client";
import { Wallet, ethers } from "ethers";
import WebSocket from 'ws';

// --- CONFIGURATION ---
const HOST = "https://clob.polymarket.com";
const WS_URL = "wss://ws-subscriptions-clob.polymarket.com/ws/market";
const GAMMA_API_URL = "https://gamma-api.polymarket.com";
const CHAIN_ID = 137; // Polygon Mainnet
const PROXY_ADDRESS = "0x917EAEE23635ABD65E04F6Fc97Fa0adbFC14ca7B"; // User's Proxy
const FUNDER_ADDRESS = PROXY_ADDRESS; // Usually same as Proxy for Safe

// RPC & Signer
const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/iWCL0aaAow4KBHQLgPrqa';
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const signer = new Wallet('0x1bada8b86615c023513997605d08cca2487f1d7be9e220ab97d963c2dcd850b0', provider);

console.log(`Bot initialized for Signer: ${signer.address} | Proxy: ${PROXY_ADDRESS}`);

// --- HELPERS ---

// 1. Time Synchronization (Crucial for Polymarket API)
const syncTime = async () => {
    try {
        const response = await fetch(`${HOST}/time`);
        if (response.ok) {
            const serverTimeText = await response.text();
            const serverTimeSec = parseInt(serverTimeText.replace(/"/g, '').trim());
            if (!isNaN(serverTimeSec)) {
                const offset = (serverTimeSec * 1000) - Date.now();
                if (Math.abs(offset) > 5000) {
                    console.log(`⚠️ Time drift ${offset}ms. Adjusting internal clock...`);
                    const originalDateNow = Date.now;
                    Date.now = () => originalDateNow() + offset;
                }
            }
        }
    } catch (e) {
        console.warn("Time sync warning:", e.message);
    }
};

// 2. WebSocket Price Fetcher
const getPriceViaWS = (tokenId) => {
    return new Promise((resolve, reject) => {
        console.log(`🔌 Connecting to WS for Price (Token: ${tokenId})...`);
        const ws = new WebSocket(WS_URL);
        const timeout = setTimeout(() => { ws.terminate(); reject(new Error("WS Timeout")); }, 5000);

        ws.on('open', () => {
            // Subscribe to market data for the token
            ws.send(JSON.stringify({ assets_ids: [tokenId], type: "market" }));
        });

        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                const updates = Array.isArray(msg) ? msg : [msg];

                for (const update of updates) {
                    if (update.event_type === "book" && update.asset_id === tokenId) {
                        if (update.asks && update.asks.length > 0) {
                            // Find Best Ask (Lowest Sell Price)
                            const bestAskObj = update.asks.reduce((prev, curr) =>
                                (parseFloat(curr.price) < parseFloat(prev.price)) ? curr : prev
                            );
                            const price = parseFloat(bestAskObj.price);
                            console.log(`⚡ WS Update: Best Ask ${price}`);

                            clearTimeout(timeout);
                            ws.close();
                            resolve(price);
                            return;
                        }
                    }
                }
            } catch (e) { /* ignore parse errors */ }
        });

        ws.on('error', (err) => { clearTimeout(timeout); reject(err); });
    });
};

// 3. Simple Balance Check (Proxy USDC)
const check_usdc_balance = async () => {
    try {
        const USCD_BRIDGED_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
        const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];
        const usdc = new ethers.Contract(USCD_BRIDGED_ADDRESS, ERC20_ABI, signer);
        const bal = await usdc.balanceOf(PROXY_ADDRESS);
        console.log(`💰 Proxy USDC Balance: ${ethers.utils.formatUnits(bal, 6)}`);
    } catch (e) { console.warn("Balance check failed:", e.message); }
};

// --- MAIN EXECUTION ---

const main = async () => {
    await syncTime();

    // Initialize Client
    let apiCreds;
    // Note: In production, store/load these securely. Here we mimic the test logic.
    // We instantiate client to derive keys.
    const tempClient = new ClobClient(HOST, CHAIN_ID, signer);
    try { apiCreds = await tempClient.deriveApiKey(); } catch (e) { }
    if (!apiCreds) { try { apiCreds = await tempClient.createApiKey(); } catch (e) { } }

    if (!apiCreds) { console.error("❌ Auth Failed"); process.exit(1); }

    const client = new ClobClient(HOST, CHAIN_ID, signer, apiCreds, 2, FUNDER_ADDRESS);

    // Check Balance
    await check_usdc_balance();

    // 1. Find Market
    console.log("🔍 Finding active market...");
    let validMarket, validTokenId;
    try {
        const res = await fetch(`${GAMMA_API_URL}/events?active=true&closed=false&limit=50&order=volume24hr&ascending=false`);
        const events = await res.json();

        for (const event of events) {
            if (event.markets) {
                for (const market of event.markets) {
                    let tokenIds = market.clobTokenIds;
                    if (typeof tokenIds === 'string') try { tokenIds = JSON.parse(tokenIds); } catch (e) { }
                    if (!Array.isArray(tokenIds) || !tokenIds.length) continue;

                    const price = market.bestAsk;
                    if (price > 0.10 && price < 0.90) { // Valid range
                        validMarket = market;
                        validTokenId = tokenIds[1]; // Outcome "NO" usually? or just the second one.
                        console.log(`🎯 Target: ${market.question} (Ref Price: ${price})`);
                        break;
                    }
                }
            }
            if (validMarket) break;
        }
    } catch (e) { console.error("Market fetch error:", e); return; }

    if (!validTokenId) { console.error("No market found."); return; }

    // 2. Get Real-Time Price
    let execPrice = await getPriceViaWS(validTokenId);
    if (!execPrice) execPrice = validMarket.bestAsk;

    // 3. Prepare Order (FOK)
    // Add small buffer to ensure fill
    const limitPrice = Math.min(execPrice + 0.03, 0.99);
    const roundedPrice = Math.floor(limitPrice * 100) / 100;

    // Amount to Spend
    const AMOUNT_USDC = 5;
    const size = Math.floor(AMOUNT_USDC / roundedPrice); // Shares

    console.log(`📝 Order: BUY ${size} shares @ ${roundedPrice} (Ref: ${execPrice})`);

    // 4. Fetch Tick Size
    let tickSize = "0.01";
    try {
        const ts = await client.getTickSize(validTokenId);
        if (ts.minimum_tick_size) tickSize = ts.minimum_tick_size.toString();
    } catch (e) { }

    // 5. Execute
    try {
        console.log("🚀 Placing FOK Order...");
        const order = await client.createOrder({
            tokenID: validTokenId,
            price: roundedPrice,
            side: "BUY",
            size: size,
            feeRateBps: 0,
            expiration: 0,
        }, { tickSize, negRisk: true });

        const response = await client.postOrder(order, "FOK");
        console.log("✅ Response:", JSON.stringify(response, null, 2));

    } catch (e) {
        console.error("❌ Order Failed:", e.message);
    }
};

main();
