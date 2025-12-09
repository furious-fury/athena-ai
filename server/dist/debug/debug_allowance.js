import "dotenv/config";
import { ethers } from "ethers";
async function main() {
    console.log("--- Checking USDC Allowances ---");
    // Bot EOA
    const address = "0xAE5f490d08fd7Cce64F2B921df7CDE86420Cedb0";
    // Exchange Proxy (Spender) - Verifying the address used in approve_usdc.ts
    const EXCHANGE_PROXY = "0x4bfb41d5b3570defd30c3975a9c70d529202fcae"; // Lowercase to avoid checksum error
    // Contracts
    const USDC_NATIVE = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
    const USDC_BRIDGED = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");
    const abi = ["function allowance(address owner, address spender) view returns (uint256)"];
    const nativeContract = new ethers.Contract(USDC_NATIVE, abi, provider);
    const bridgedContract = new ethers.Contract(USDC_BRIDGED, abi, provider);
    try {
        const [nativeAllow, bridgedAllow] = await Promise.all([
            nativeContract.allowance(address, EXCHANGE_PROXY),
            bridgedContract.allowance(address, EXCHANGE_PROXY)
        ]);
        console.log(`\nWallet: ${address}`);
        console.log(`Spender: ${EXCHANGE_PROXY}`);
        console.log(`\n✅ Native USDC Allowance: ${ethers.utils.formatUnits(nativeAllow, 6)} USDC`);
        console.log(`⚠️ Bridged USDC Allowance: ${ethers.utils.formatUnits(bridgedAllow, 6)} USDC.e`);
        if (nativeAllow.eq(0)) {
            console.warn("ALERT: Native USDC Allowance is 0. You need to run approve_usdc.ts!");
        }
        else {
            console.log("Native USDC is APPROVED.");
        }
    }
    catch (e) {
        console.error("Error:", e.message);
    }
}
main();
//# sourceMappingURL=debug_allowance.js.map