
import fetch from "node-fetch";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { NOT: { scwAddress: null } }
    });

    if (!user) {
        console.log("No user found");
        return;
    }

    const proxy = user.scwAddress;
    const eoa = user.walletAddress;

    console.log(`Checking Gamma History for Proxy: ${proxy}`);

    // Try Gamma API
    try {
        const url = `https://gamma-api.polymarket.com/trades?user=${proxy}&limit=10`;
        console.log(`Fetching: ${url}`);
        const res = await fetch(url);
        const data = await res.json();

        console.log(`Gamma Proxy Trades: ${Array.isArray(data) ? data.length : 'Error'}`);
        if (Array.isArray(data) && data.length > 0) {
            console.log("Sample:", JSON.stringify(data[0], null, 2));
        }
    } catch (e) {
        console.error("Gamma Proxy failed", e.message);
    }

    console.log(`Checking Gamma History for EOA: ${eoa}`);
    try {
        const url = `https://gamma-api.polymarket.com/trades?user=${eoa}&limit=10`;
        const res = await fetch(url);
        const data = await res.json();

        console.log(`Gamma EOA Trades: ${Array.isArray(data) ? data.length : 'Error'}`);
        if (Array.isArray(data) && data.length > 0) {
            console.log("Sample:", JSON.stringify(data[0], null, 2));
        }
    } catch (e) {
        console.error("Gamma EOA failed", e.message);
    }
}

main().finally(() => prisma.$disconnect());
