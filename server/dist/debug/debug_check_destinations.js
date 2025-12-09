import "dotenv/config";
import { ethers } from "ethers";
const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const PROXY_ADDRESS = "0xA93a5464647Ea593F863061f676C21dA2E8Db953";
const CTF_EXCHANGE = "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045"; // Main CTF Exchange
async function main() {
    console.log(`Checking CTF Exchange Balance for ${PROXY_ADDRESS}`);
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    // CTF Exchange usually doesn't hold user funds in the mapping directly for USDC 
    // in the new system (Asset-based), but let's check just in case it's the old system or I'm mistaken.
    // Actually, Polymarket now uses "Proxy" wallets that hold funds.
    // If the Proxy sent funds away, it might have sent them to a "Relayer" or "Operator".
    // Let's check Gnosis Safe "getModules" maybe? 
    // Or just check if the "1 transaction" was a transfer to the Exchange.
    // But since I can't read logs easily (RPC limit), I'll blindly check CTF collateral.
    // There isn't a simple "balanceOf" on CTF for USDC collateral usually, it manages Positions.
    // Alternative: Check if funds went to the EOA?
    // User Funding Wallet: 0x0608...
    // EOA (Signer): 0xAE5...
    console.log("Checking if funds were forwarded to EOA (0xAE5...)...");
    const usdc = new ethers.Contract("0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", ["function balanceOf(address) view returns (uint256)"], provider);
    const balEOA = await usdc.balanceOf("0xAE5f490d08fd7Cce64F2B921df7CDE86420Cedb0");
    console.log(`EOA Balance: ${ethers.utils.formatUnits(balEOA, 6)}`);
    // Check if forwarded to User Funding Wallet (Refund?)
    const balFunding = await usdc.balanceOf("0x06088B815A4bB37E7836D191F9B0bb252B3A9f9f");
    console.log(`Funding Wallet Balance: ${ethers.utils.formatUnits(balFunding, 6)}`);
}
main();
//# sourceMappingURL=debug_check_destinations.js.map