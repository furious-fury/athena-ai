import { place_trade } from "../src/tools/polymarket";
import { prisma } from "../src/config/database";
import dotenv from "dotenv";

dotenv.config();

/**
 * Usage: npx ts-node scripts/test-clob.ts <userId> <marketId>
 */
async function main() {
    const args = process.argv.slice(2);
    const userId = args[0];
    const marketId = args[1];

    if (!userId || !marketId) {
        console.error("Usage: npx ts-node scripts/test-clob.ts <userId> <marketId>");

        // List users for convenience
        const users = await prisma.user.findMany({ select: { id: true, walletAddress: true, apiKey: true } });
        console.log("\nAvailable Users:");
        users.forEach(u => console.log(`- ${u.id} (${u.walletAddress}) [Has Keys: ${!!u.apiKey}]`));
        process.exit(1);
    }

    console.log(`Testing CLOB trade for User ${userId} on Market ${marketId}...`);

    try {
        const result = await place_trade({
            userId,
            agentId: "test-script",
            marketId,
            outcome: "YES", // Default to YES
            amount: 5, // Small amount (min is usually 5)
            side: "BUY"
        });

        console.log("✅ Trade Success:", result);
    } catch (error: any) {
        console.error("❌ Trade Failed:", error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
