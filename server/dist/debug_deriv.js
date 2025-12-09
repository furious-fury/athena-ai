import "dotenv/config";
import { ethers } from "ethers";
import { SmartWalletService } from "./services/smartWallet.service.js";
import { SmartAccountSigner } from "./tools/smart-account-signer.js";
import { ClobClient } from "@polymarket/clob-client";
import * as fs from 'fs';
import * as util from 'util';
// Setup logging
const logFile = fs.createWriteStream('debug_full.log', { flags: 'w' });
const logStdout = process.stdout;
console.log = function (...args) {
    const msg = util.format.apply(null, args) + '\n';
    logFile.write(msg);
    logStdout.write(msg);
};
console.error = function (...args) {
    const msg = '[ERROR] ' + util.format.apply(null, args) + '\n';
    logFile.write(msg);
    logStdout.write(msg);
};
// Global error handlers
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, p) => {
    console.error('UNHANDLED REJECTION:', reason);
});
async function main() {
    console.log("--- Starting Debug Script for API Key Derivation (SAFE 1.3.0 EDITION) ---");
    try {
        // 1. Setup Environment
        console.log("Step 1: Setup Environment");
        const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        console.log("Provider created");
        // 2. Mock User Data
        console.log("Step 2: Create Safe Account");
        let accountData;
        try {
            accountData = await SmartWalletService.createOneClickAccount();
        }
        catch (err) {
            const errorMsg = `CRASH in createOneClickAccount: ${err.stack || err}`;
            console.error(errorMsg);
            return;
        }
        const { address: scwAddress, privateKey: ownerPK } = accountData;
        console.log(`SCW Address: ${scwAddress}`);
        // 2b. Deploy Account (Verify code later)
        console.log("Step 2b: Deploying Smart Account...");
        try {
            // force deploy
            const txHash = await SmartWalletService.sendTransaction(ownerPK, scwAddress, 0n, "0x");
            console.log(`Tx Sent: ${txHash}. Waiting for confirmation...`);
            await provider.waitForTransaction(txHash, 1, 60000);
            console.log(`Deployed!`);
        }
        catch (deployErr) {
            console.error("Deployment failed or already/deployed:", deployErr);
        }
        // 3. Initialize Signer
        console.log("Step 3: Initialize Signer");
        let client;
        try {
            client = await SmartWalletService.getSmartAccountClient(ownerPK);
        }
        catch (err) {
            console.error(`CRASH in getSmartAccountClient: ${err.stack || err}`);
            return;
        }
        const signer = new SmartAccountSigner(client, provider);
        console.log("Signer initialized");
        // 4. Derivation
        console.log("Step 4: Attempt Derivation");
        console.log("Waiting 10s for RPC propagation...");
        await new Promise(resolve => setTimeout(resolve, 10000));
        const chainId = 137;
        const clobClient = new ClobClient("https://clob.polymarket.com", chainId, signer);
        try {
            console.log("Calling deriveApiKey...");
            const keys = await clobClient.deriveApiKey();
            console.log("Success! Keys:", keys);
        }
        catch (e) {
            console.error("Derivation Failed (Could mean 1271 is still failing or Header format).");
        }
        // 5. MANUAL DEBUG: Verify Code and Signature
        console.log("Step 5: Verifying Signature On-Chain");
        // Verify Code exists
        const code = await provider.getCode(scwAddress);
        console.log("SCW Code Length:", code.length);
        if (code === "0x") {
            console.error("CRITICAL: SCW Address has NO CODE. Deployment Failed.");
            return;
        }
        else {
            console.log("SCW Code exists.");
        }
        const exchangeAddress = ethers.utils.getAddress("0x4F9827Fa50C338440071A3Fce747447990146056".toLowerCase());
        const domain = {
            name: "Polymarket CLOB",
            version: "1",
            chainId: 137,
            verifyingContract: exchangeAddress
        };
        const types = { Test: [{ name: 'content', type: 'string' }] };
        const value = { content: 'test' };
        const typedDataHash = ethers.utils._TypedDataEncoder.hash(domain, types, value);
        console.log("Values for verification:");
        console.log("Data Hash:", typedDataHash);
        try {
            // Sign using the SmartAccountSigner which now implements SafeMessage wrapping logic
            console.log("Signing with SmartAccountSigner (SafeWrapped)...");
            const wrappedSignature = await signer._signTypedData(domain, types, value);
            console.log("Wrapped Signature:", wrappedSignature);
            // Sign with EOA (Raw)
            const eoaWallet = new ethers.Wallet(ownerPK);
            const eoaSignature = await eoaWallet._signTypedData(domain, types, value);
            console.log("Raw EOA Signature:   ", eoaSignature);
            // Call SCW isValidSignature(bytes32, bytes)
            const scwContract = new ethers.Contract(scwAddress, [
                "function isValidSignature(bytes32, bytes) public view returns (bytes4)"
            ], provider);
            console.log("Calling isValidSignature on Safe 1.3.0 with Wrapped Signature...");
            try {
                const magicValue = await scwContract.isValidSignature(typedDataHash, wrappedSignature);
                console.log("Magic Value returned:", magicValue);
                if (magicValue === "0x1626ba7e") {
                    console.log("SUCCESS! Safe accepts Wrapped signature.");
                }
                else {
                    console.error("FAILED! Safe rejected Wrapped signature.");
                }
            }
            catch (err) {
                console.error("Wrapped Signature Validation failed:", err.reason || err.code || err);
            }
        }
        catch (verErr) {
            console.error("Verification Setup Error:", verErr);
        }
    }
    catch (criticalError) {
        const errorMsg = `Critical Script Failure: ${criticalError.stack || criticalError}`;
        console.error(errorMsg);
    }
}
main();
//# sourceMappingURL=debug_deriv.js.map