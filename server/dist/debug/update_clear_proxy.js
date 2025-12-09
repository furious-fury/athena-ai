import "dotenv/config";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
const connectionString = `${process.env.DATABASE_URL}`;
const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const EOA_ADDRESS = "0xAE5f490d08fd7Cce64F2B921df7CDE86420Cedb0";
const NATIVE_USDC = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
const BRIDGED_USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
async function main() {
    console.log("--- Resetting to EOA Mode & Checking Funds ---");
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });
    try {
        await prisma.$connect();
        const userId = "cmixw8l8j0000fgiyknopjqfe";
        // 1. Clear scwAddress to disable Proxy Mode
        const updated = await prisma.user.update({
            where: { id: userId },
            data: { scwAddress: null } // Set to null/empty
        });
        console.log("✅ Cleared scwAddress. Bot will now use EOA Mode.");
        // 2. Check Balance of EOA
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const usdcNative = new ethers.Contract(NATIVE_USDC, ["function balanceOf(address) view returns (uint256)"], provider);
        const usdcBridged = new ethers.Contract(BRIDGED_USDC, ["function balanceOf(address) view returns (uint256)"], provider);
        const balNative = await usdcNative.balanceOf(EOA_ADDRESS);
        const balBridged = await usdcBridged.balanceOf(EOA_ADDRESS);
        const polBal = await provider.getBalance(EOA_ADDRESS);
        console.log(`EOA Native USDC: ${ethers.utils.formatUnits(balNative, 6)}`);
        console.log(`EOA Bridged USDC: ${ethers.utils.formatUnits(balBridged, 6)}`);
        console.log(`EOA POL Balance: ${ethers.utils.formatEther(polBal)}`);
        if (balNative.gt(0) || balBridged.gt(0)) {
            console.log("🎉 FUNDS DETECTED! Bot is ready to trade.");
            // Note: If Native USDC is present, ClobClient might need conversion or might accept it? 
            // Clob usually wants Bridged. Polymarket Bridge handles native->bridged? 
            // Actually, if user sent Native USDC, we might need to swap/bridge if CLOB rejects it.
            // But let's see.
        }
        else {
            console.log("⚠️ No USDC funds detected yet. Waiting for tx confirmation...");
        }
    }
    catch (error) {
        console.error("Error:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=update_clear_proxy.js.map