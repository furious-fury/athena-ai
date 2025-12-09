
import "dotenv/config";
import { ethers } from "ethers";

const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const PROXY_ADDRESS = "0xA93a5464647Ea593F863061f676C21dA2E8Db953";
const NATIVE_USDC = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    // Check Native USDC
    const usdcNative = new ethers.Contract(NATIVE_USDC, ["function balanceOf(address) view returns (uint256)"], provider);
    const balNative = await usdcNative.balanceOf(PROXY_ADDRESS);
    console.log(`Native USDC Balance (0xA93...): ${ethers.utils.formatUnits(balNative, 6)}`);
}

main();
