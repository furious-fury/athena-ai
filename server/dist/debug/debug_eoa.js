import "dotenv/config";
import { ethers } from "ethers";
import { ClobClient } from "@polymarket/clob-client";
async function main() {
    console.log("--- Starting EOA Debug Script ---");
    try {
        const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        // 1. Create Random EOA
        console.log("Step 1: Creating Random EOA...");
        const wallet = ethers.Wallet.createRandom().connect(provider);
        console.log("EOA Address:", wallet.address);
        console.log("EOA Private Key:", wallet.privateKey);
        // 2. Derive Keys
        console.log("Step 2: Attempting API Key Derivation (Direct EOA)...");
        const chainId = 137;
        const clobClient = new ClobClient("https://clob.polymarket.com", chainId, wallet);
        console.log("Calling deriveApiKey...");
        const keys = await clobClient.deriveApiKey();
        console.log("SUCCESS! Derived Keys:", keys);
    }
    catch (err) {
        console.error("CRITICAL FAILURE:", err);
    }
}
main();
//# sourceMappingURL=debug_eoa.js.map