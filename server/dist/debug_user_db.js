import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
const connectionString = `${process.env.DATABASE_URL}`;
async function main() {
    console.log("--- Inspecting User Logic ---");
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });
    try {
        await prisma.$connect();
        const userId = "cmixw8l8j0000fgiyknopjqfe";
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            console.log("User ID:", user.id);
            console.log("SCW Address (Proxy):", user.scwAddress);
            console.log("Wallet Address (Other):", user.walletAddress);
        }
        else {
            console.log("User not found");
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
//# sourceMappingURL=debug_user_db.js.map