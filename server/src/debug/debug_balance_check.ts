
import "dotenv/config";
import { ethers } from "ethers";

async function main() {
    console.log("--- Checking USDC Balances (Native vs Bridged) ---");

    // Bot EOA
    const address = "0xAE5f490d08fd7Cce64F2B921df7CDE86420Cedb0";

    // Contracts
    const USDC_NATIVE = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
    const USDC_BRIDGED = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // Polymarket usually uses this (USDC.e)

    const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");

    const nativeContract = new ethers.Contract(USDC_NATIVE, ["function balanceOf(address) view returns (uint256)"], provider);
    const bridgedContract = new ethers.Contract(USDC_BRIDGED, ["function balanceOf(address) view returns (uint256)"], provider);

    try {
        const [nativeBal, bridgedBal, polBal] = await Promise.all([
            nativeContract.balanceOf(address),
            bridgedContract.balanceOf(address),
            provider.getBalance(address)
        ]);

        console.log(`\nWallet: ${address}`);
        console.log(`POL Balance: ${ethers.utils.formatEther(polBal)} POL`);

        console.log(`\n✅ Native USDC (0x3c49...): ${ethers.utils.formatUnits(nativeBal, 6)} USDC`);
        console.log(`⚠️ Bridged USDC (0x2791...): ${ethers.utils.formatUnits(bridgedBal, 6)} USDC.e`);

        if (bridgedBal.lt(ethers.utils.parseUnits("1", 6)) && nativeBal.gt(0)) {
            console.log("\nCONCLUSION: You have NATIVE USDC, but likely need BRIDGED USDC (USDC.e) for this market.");
            console.log("Polymarket CLOB usually settles in Bridged USDC.");
        } else if (bridgedBal.gt(0)) {
            console.log("\nCONCLUSION: You HAVE Bridged USDC. The issue might be Allowance?");
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

main();
