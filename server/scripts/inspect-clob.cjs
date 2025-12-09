
const { ClobClient } = require("@polymarket/clob-client");
const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("Inspecting CLOB Client...");

    try {
        const constants = require("@polymarket/clob-client/dist/signing/constants");
        console.log("Constants:", JSON.stringify(constants, null, 2));

        console.log("\n--- EXECUTING createL1Headers ---");
        const { createL1Headers } = require("@polymarket/clob-client/dist/headers");
        const { buildClobEip712Signature } = require("@polymarket/clob-client/dist/signing/eip712");

        console.log("buildClobEip712Signature Source:\n", buildClobEip712Signature.toString());

        const wallet = ethers.Wallet.createRandom();
        const address = await wallet.getAddress();
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonce = 0;
        const chainId = 1;

        console.log("Mock Address:", address);

        try {
            // Correct call: createL1Headers(signer, chainId, nonce, timestamp)
            const headers = await createL1Headers(wallet, chainId, nonce, timestamp);
            console.log("Resulting Headers:", headers);

        } catch (err) {
            console.log("Execution error:", err.message);
        }

    } catch (e) {
        console.error(e);
    }
}

main();
