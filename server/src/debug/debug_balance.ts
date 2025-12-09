
import "dotenv/config";
import { ethers } from "ethers";

const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const CTF_EXCHANGE_ADDRESS = "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E"; // Standard Polymarket Exchange

// The address from the logs
const EOA_ADDRESS = "0xAE5f490d08fd7Cce64F2B921df7CDE86420Cedb0";

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
];

async function main() {
    console.log("--- Checking Balance & Allowance ---");
    console.log(`EOA: ${EOA_ADDRESS}`);

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);

    try {
        const balance = await usdc.balanceOf(EOA_ADDRESS);
        const allowance = await usdc.allowance(EOA_ADDRESS, CTF_EXCHANGE_ADDRESS);

        console.log(`USDC Balance: ${ethers.utils.formatUnits(balance, 6)} USDC`);
        console.log(`ClOB Allowance: ${ethers.utils.formatUnits(allowance, 6)} USDC`);

        if (balance.eq(0)) {
            console.error("❌ ERROR: No USDC Balance. Please fund the EOA.");
        }

        if (allowance.lt(ethers.utils.parseUnits("10", 6))) {
            console.error("❌ ERROR: Low Allowance. Need to approve CTF Exchange.");
        }

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

main();
