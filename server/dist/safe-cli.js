import { predictSafeAddress } from './predictSafe';
import { deploySafe } from './deploySafe';
import { createEnableModuleTx, relayEnableModuleTx } from './enableModule';
import { executeAgentTrade } from './agentExecutor';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
dotenv.config();
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const SERVER_KEY = process.env.SERVER_PRIVATE_KEY;
const USER_KEY = process.env.USER_PRIVATE_KEY; // For demo purposes, we need user key to sign enable
const AGENT_KEY = process.env.AGENT_PRIVATE_KEY || SERVER_KEY;
const MODULE_ADDR = process.env.AGENT_MODULE_ADDRESS;
const ROUTER_ADDR = process.env.POLYMARKET_ROUTER || ethers.constants.AddressZero;
async function main() {
    const cmd = process.argv[2];
    const userUser = process.argv[3]; // Optional override
    if (!SERVER_KEY)
        throw new Error("Missing SERVER_PRIVATE_KEY in .env");
    // Derived or Env User
    const userWallet = USER_KEY ? new ethers.Wallet(USER_KEY) : ethers.Wallet.createRandom();
    const userEOA = userWallet.address;
    console.log(`--- Safe CLI ---`);
    console.log(`RPC: ${RPC_URL}`);
    console.log(`User EOA: ${userEOA}`);
    switch (cmd) {
        case 'predict': {
            const res = await predictSafeAddress(RPC_URL, SERVER_KEY, userEOA);
            console.log("Predicted Safe:", JSON.stringify(res, null, 2));
            break;
        }
        case 'deploy': {
            const res = await deploySafe(RPC_URL, SERVER_KEY, userEOA);
            console.log("Deploy Result:", res);
            break;
        }
        case 'enable': {
            if (!MODULE_ADDR)
                throw new Error("Define AGENT_MODULE_ADDRESS in .env");
            if (!USER_KEY)
                throw new Error("Need USER_PRIVATE_KEY to sign enable tx");
            // 1. Predict (to get address)
            const { predictedAddress } = await predictSafeAddress(RPC_URL, SERVER_KEY, userEOA);
            console.log(`Target Safe: ${predictedAddress}`);
            // 2. Prepare Tx
            console.log("Preparing Enable Module Tx...");
            const signedTx = await createEnableModuleTx(RPC_URL, predictedAddress, MODULE_ADDR, USER_KEY);
            // 3. Relay
            console.log("Relaying...");
            const receipt = await relayEnableModuleTx(RPC_URL, predictedAddress, signedTx, SERVER_KEY);
            console.log("Enabled! Tx:", receipt.transactionHash);
            break;
        }
        case 'trade': {
            if (!MODULE_ADDR)
                throw new Error("Define AGENT_MODULE_ADDRESS");
            const { predictedAddress } = await predictSafeAddress(RPC_URL, SERVER_KEY, userEOA);
            await executeAgentTrade(RPC_URL, AGENT_KEY, MODULE_ADDR, predictedAddress, ROUTER_ADDR);
            break;
        }
        default:
            console.log("Usage: ts-node src/safe-cli.ts [predict|deploy|enable|trade]");
    }
}
main().catch(console.error);
//# sourceMappingURL=safe-cli.js.map