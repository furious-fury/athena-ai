import "dotenv/config";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { ClobClient } from "@polymarket/clob-client";
const connectionString = `${process.env.DATABASE_URL}`;
async function main() {
    console.log("--- Checking CLOB State ---");
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });
    // The address user provided as Proxy
    const PROXY_ADDRESS = "0xA93a5464647Ea593F863061f676C21dA2E8Db953";
    try {
        await prisma.$connect();
        const userId = "cmixw8l8j0000fgiyknopjqfe";
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.scwOwnerPrivateKey)
            throw new Error("User key not found");
        const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");
        const wallet = new ethers.Wallet(user.scwOwnerPrivateKey, provider);
        console.log(`EOA Used: ${wallet.address}`);
        console.log(`Target Proxy: ${PROXY_ADDRESS}`);
        // Initialize CLOB Client
        const client = new ClobClient("https://clob.polymarket.com", 137, wallet, user.apiKey ? {
            key: user.apiKey,
            secret: user.apiSecret,
            passphrase: user.apiPassphrase
        } : undefined, 1, // Proxy Mode
        PROXY_ADDRESS);
        // Check if we can get trades or balance info
        try {
            console.log("Fetching Trades...");
            // @ts-ignore - limit might not be in type definition but often accepted by API
            const trades = await client.getTrades({ limit: 5 });
            console.log("Trades Response:", JSON.stringify(trades, null, 2));
        }
        catch (e) {
            console.error("Fetch Trades Failed:", e?.message);
        }
        // Try getting order history or open orders to see activity
        try {
            console.log("Fetching Open Orders...");
            const orders = await client.getOpenOrders();
            console.log("Open Orders:", JSON.stringify(orders, null, 2));
        }
        catch (e) {
            console.error("Fetch Orders Failed:", e?.message);
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
//# sourceMappingURL=debug_clob_state.js.map