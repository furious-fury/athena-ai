
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

async function main() {
    console.log("--- Injecting Previously Generated API Keys ---");
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });

    const userId = "cmixw8l8j0000fgiyknopjqfe";

    // Keys from debug_log_6.txt (TEST 1 - Success)
    const apiKey = '67b61a71-c7bf-0bca-3962-e67446fd202d';
    const apiSecret = 'dA-xvkbk0Z_Je8wuWd6Ej-wivQo5jaa_OPBgQ3j5aB8=';
    const apiPassphrase = 'e592d852dc6ca229fd25898f09bc80da1787480d549a562f7ad9d14aa3cb2419';

    try {
        await prisma.$connect();

        const update = await prisma.user.update({
            where: { id: userId },
            data: {
                apiKey,
                apiSecret,
                apiPassphrase
            }
        });

        console.log("SUCCESS: Recovered keys injected for user:", update.id);
        console.log("The server should now be able to trade without re-creating keys.");

    } catch (err: any) {
        console.error("Injection Failed:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
