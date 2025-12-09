import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const connectionString = `${process.env.DATABASE_URL}`;
async function main() {
    console.log("--- Account Credentials ---");
    const userId = "cmixw8l8j0000fgiyknopjqfe";
    // Initialize prisma locally
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });
    try {
        await prisma.$connect();
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            console.error("User not found!");
            return;
        }
        console.log("UserID:", user.id);
        console.log("EOA Address:", user.walletAddress); // or derived from PK
        console.log("Proxy (Safe) Address:", user.scwAddress);
        console.log("Private Key:", user.scwOwnerPrivateKey);
        console.log("\nINSTRUCTIONS:");
        console.log("1. Import 'Private Key' into MetaMask or similar wallet.");
        console.log("2. Go to https://polymarket.com and Log In (Connect Wallet).");
        console.log("3. Ensure you are on Polygon network.");
        console.log("4. Deposit a small amount of USDC/MATIC if prompted (or just ensure account is 'activated').");
        console.log("5. Once logged in and 'Proxy' is deployed (you can check settings), return here.");
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=reveal_pk.js.map