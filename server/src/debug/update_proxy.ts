
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

async function main() {
    console.log("--- Updating Proxy Address ---");
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });

    // The address user provided:
    const NEW_PROXY = "0xA93a5464647Ea593F863061f676C21dA2E8Db953";
    const userId = "cmixw8l8j0000fgiyknopjqfe";

    try {
        await prisma.$connect();

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { scwAddress: NEW_PROXY }
        });

        console.log("✅ Updated User:", updated.id);
        console.log("New SCW Address:", updated.scwAddress);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
