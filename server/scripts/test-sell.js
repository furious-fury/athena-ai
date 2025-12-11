import "dotenv/config";
import { ClobClient } from "@polymarket/clob-client";
import { Wallet, ethers } from "ethers";
import WebSocket from 'ws';

// --- CONFIGURATION ---
const HOST = "https://clob.polymarket.com";
const WS_URL = "wss://ws-subscriptions-clob.polymarket.com/ws/market";
const CHAIN_ID = 137;
const PROXY_ADDRESS = "0x917EAEE23635ABD65E04F6Fc97Fa0adbFC14ca7B";
const CTF_ADDRESS = "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045"; // For Balance Check

const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/iWCL0aaAow4KBHQLgPrqa';
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const signer = new Wallet('0x1bada8b86615c023513997605d08cca2487f1d7be9e220ab97d963c2dcd850b0', provider);

console.log(`Bot initialized for Signer: ${signer.address} | Proxy: ${PROXY_ADDRESS}`);

// --- HELPERS ---

const syncTime = async () => {
    try {
        const response = await fetch(`${HOST}/time`);
        if (response.ok) {
            const serverTimeText = await response.text();
            const serverTimeSec = parseInt(serverTimeText.replace(/"/g, '').trim());
            if (!isNaN(serverTimeSec)) {
                const offset = (serverTimeSec * 1000) - Date.now();
                if (Math.abs(offset) > 5000) {
                    console.log(`⚠️ Time drift ${offset}ms. Adjusting...`);
                    const originalDateNow = Date.now;
                    Date.now = () => originalDateNow() + offset;
                }
            }
        }
    } catch (e) { console.warn("Time sync error:", e); }
};

const getBestBidViaWS = (tokenId) => {
    return new Promise((resolve, reject) => {
        console.log(`🔌 Connecting to WS for BIDS (Token: ${tokenId})...`);
        const ws = new WebSocket(WS_URL);
        const timeout = setTimeout(() => { ws.terminate(); reject(new Error("WS Timeout")); }, 5000);

        ws.on('open', () => {
            ws.send(JSON.stringify({ assets_ids: [tokenId], type: "market" }));
        });

        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                const updates = Array.isArray(msg) ? msg : [msg];
                for (const update of updates) {
                    if (update.event_type === "book" && update.asset_id === tokenId) {
                        if (update.bids && update.bids.length > 0) {
                            // Find Best Bid (Highest Price)
                            const bestBidObj = update.bids.reduce((prev, curr) =>
                                (parseFloat(curr.price) > parseFloat(prev.price)) ? curr : prev
                            );
                            const price = parseFloat(bestBidObj.price);
                            console.log(`⚡ WS Update: Best Bid ${price}`);
                            clearTimeout(timeout);
                            ws.close();
                            resolve(price);
                            return;
                        }
                    }
                }
            } catch (e) { }
        });
        ws.on('error', (err) => { clearTimeout(timeout); reject(err); });
    });
};

const check_share_balance = async (tokenId) => {
    try {
        const ctf = new ethers.Contract(CTF_ADDRESS, ["function balanceOf(address, uint256) view returns (uint256)"], signer);
        const bal = await ctf.balanceOf(PROXY_ADDRESS, tokenId);
        const balFmt = ethers.utils.formatUnits(bal, 6);
        console.log(`💰 Proxy Shares: ${balFmt}`);
        return { raw: bal, fmt: parseFloat(balFmt) };
    } catch (e) { console.error("Balance Check Failed:", e); return { fmt: 0 }; }
};

// --- MAIN EXECUTION ---

const main = async () => {
    await syncTime();

    // Init Client
    const tempClient = new ClobClient(HOST, CHAIN_ID, signer);
    let apiCreds;
    try { apiCreds = await tempClient.deriveApiKey(); } catch (e) { }
    if (!apiCreds) { try { apiCreds = await tempClient.createApiKey(); } catch (e) { } }
    if (!apiCreds) { console.error("❌ Auth Failed"); process.exit(1); }

    const client = new ClobClient(HOST, CHAIN_ID, signer, apiCreds, 2, PROXY_ADDRESS);

    // 1. Identify Target Token (From previous session)
    // In a real bot, you'd look up your positions. Here we hardcode the one we know we have.
    const TARGET_TOKEN_ID = "18289842382539867639079362738467334752951741961393928566628307174343542320349";

    // 2. Check Balance
    const balance = await check_share_balance(TARGET_TOKEN_ID);
    if (balance.fmt <= 0) { console.log("No shares to sell."); return; }

    // 3. Get Price
    let execPrice = await getBestBidViaWS(TARGET_TOKEN_ID);
    if (!execPrice) { console.error("No Bid found."); return; }

    // 4. Prepare Order (FOK)
    // Sell into Bid (minus small buffer to ensure fill)
    const limitPrice = Math.max(execPrice - 0.03, 0.02);
    const roundedPrice = Math.floor(limitPrice * 100) / 100;

    // Size: Sell All (Rounded to 2 decimals)
    let size = Math.floor(balance.fmt * 100) / 100;

    if (size <= 0) { console.log("Balance too small for minimum order."); return; }

    console.log(`📝 Order: SELL ${size} shares @ ${roundedPrice} (Ref Bid: ${execPrice})`);

    // 5. Execute
    try {
        console.log("🚀 Placing FOK Order...");
        const order = await client.createOrder({
            tokenID: TARGET_TOKEN_ID,
            price: roundedPrice,
            side: "SELL",
            size: size,
            feeRateBps: 0,
            expiration: 0,
        }, { negRisk: true }); // Removed explicit tickSize fetch for speed, defaults usually fine or can add back if errors

        const response = await client.postOrder(order, "FOK");
        console.log("✅ Response:", JSON.stringify(response, null, 2));
    } catch (e) {
        console.error("❌ Sell Failed:", e.message);
    }
};

main();
