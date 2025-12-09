
import "dotenv/config";
import { ethers } from "ethers";
import fetch from "node-fetch";

async function main() {
    console.log("--- Manual Derivation Test Variations ---");

    const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");
    // Create random wallet
    const wallet = ethers.Wallet.createRandom().connect(provider);
    console.log("Wallet:", wallet.address);

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = "GET";
    const path = "/auth/derive-api-key";
    const body = "";

    // VARIATION 1: Nonce=Timestamp, Lowercase Address
    console.log("\n--- Variation 1: Nonce=Timestamp, Lowercase Address ---");
    const nonce1 = timestamp;
    const addressLC = wallet.address.toLowerCase();

    // Message: timestamp + nonce + method + path + body
    const message1 = `${timestamp}${nonce1}${method}${path}${body}`;
    console.log("Msg1:", message1);
    const signature1 = await wallet.signMessage(message1);

    const headers1 = {
        "Accept": "*/*",
        "POLY_ADDRESS": addressLC,
        "POLY_SIGNATURE": signature1,
        "POLY_TIMESTAMP": timestamp,
        "POLY_NONCE": nonce1
    };

    await doFetch(headers1);

    // VARIATION 2: Nonce=0, Lowercase Address
    console.log("\n--- Variation 2: Nonce=0, Lowercase Address ---");
    const nonce2 = "0";
    const message2 = `${timestamp}${nonce2}${method}${path}${body}`;
    console.log("Msg2:", message2);
    const signature2 = await wallet.signMessage(message2);

    const headers2 = {
        "Accept": "*/*",
        "POLY_ADDRESS": addressLC,
        "POLY_SIGNATURE": signature2,
        "POLY_TIMESTAMP": timestamp,
        "POLY_NONCE": nonce2
    };

    await doFetch(headers2);

    // VARIATION 3: EIP-712 Style (Hypothesis)
    // If signMessage (Text) fails, maybe it expects TypedData.
    // I won't implement full EIP-712 here yet unless strict fail.
}

async function doFetch(headers: any) {
    try {
        const url = "https://clob.polymarket.com/auth/derive-api-key";
        const res = await fetch(url, { method: "GET", headers });
        console.log("Status:", res.status);
        const txt = await res.text();
        console.log("Response:", txt);
    } catch (e: any) {
        console.error("Fetch Error:", e.message);
    }
}

main();
