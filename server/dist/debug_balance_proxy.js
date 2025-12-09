import "dotenv/config";
import { ethers } from "ethers";
const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const PROXY_ADDRESS = "0xA93a5464647Ea593F863061f676C21dA2E8Db953";
const USDC_ADDR = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
async function main() {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    console.log(`Checking balance for: ${PROXY_ADDRESS}`);
    // Check POL
    const polBalance = await provider.getBalance(PROXY_ADDRESS);
    console.log(`POL Balance: ${ethers.utils.formatEther(polBalance)} POL`);
    // Check USDC (Bridged)
    const usdcBridged = new ethers.Contract("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", ["function balanceOf(address) view returns (uint256)"], provider);
    const balBridged = await usdcBridged.balanceOf(PROXY_ADDRESS);
    console.log(`Bridged USDC (0x2791...): ${ethers.utils.formatUnits(balBridged, 6)} USDC`);
    // Check USDC (Native)
    const usdcNative = new ethers.Contract("0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", ["function balanceOf(address) view returns (uint256)"], provider);
    const balNative = await usdcNative.balanceOf(PROXY_ADDRESS);
    console.log(`Native USDC (0x3c49...): ${ethers.utils.formatUnits(balNative, 6)} USDC`);
}
main();
//# sourceMappingURL=debug_balance_proxy.js.map