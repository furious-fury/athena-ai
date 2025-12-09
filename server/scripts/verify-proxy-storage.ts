import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    let userId = process.argv[2];

    if (!userId) {
        console.log("No User ID provided. Searching for any user with proxy...");
        const user = await prisma.user.findFirst({
            where: { proxyAddress: { not: null } },
            select: { id: true }
        });

        if (!user) {
            console.log("No users with proxy found in database.");
            return;
        }
        userId = user.id;
        console.log(`Found user: ${userId}`);
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, proxyAddress: true, proxyPrivateKey: true }
    });

    if (!user) {
        console.log("User not found");
        return;
    }

    console.log(`\n--- Verification Results ---`);
    console.log(`User ID: ${user.id}`);
    console.log(`Proxy Address: ${user.proxyAddress}`);
    console.log(`Has Private Key Field: ${user.proxyPrivateKey !== undefined}`);
    console.log(`Private Key Value Present: ${!!user.proxyPrivateKey}`);
    console.log(`Private Key Length: ${user.proxyPrivateKey ? user.proxyPrivateKey.length : 0}`);
    console.log(`----------------------------\n`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
