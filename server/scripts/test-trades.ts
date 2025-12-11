
import { PrismaClient } from "@prisma/client";
import { ethers } from "ethers";
import { ClobClient } from "@polymarket/clob-client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    // Get the first user with a proxy
    const user = await prisma.user.findFirst({
        where: { NOT: { scwAddress: null } }
    });

    if (!user) {
        console.log("No user with proxy found.");
        return;
    }

    console.log(`Testing for User ID: ${user.id}`);
    console.log(`Proxy Address: ${user.scwAddress}`);
    console.log(`EOA Address: ${user.walletAddress}`); // This might be the same if bug persisted, but let's see.
    console.log(`Signer Key Available: ${!!user.scwOwnerPrivateKey}`);

    if (!user.scwOwnerPrivateKey) return;

    const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");
    const wallet = new ethers.Wallet(user.scwOwnerPrivateKey, provider);

    const clobClient = new ClobClient(
        "https://clob.polymarket.com",
        137,
        wallet,
        {
            key: user.apiKey as string,
            secret: user.apiSecret as string,
            passphrase: user.apiPassphrase as string
        },
        2, // Proxy Mode
        user.scwAddress as string
    );

    try {
        console.log("Fetching trades with maker_address = proxy...");
        const trades = await clobClient.getTrades({
            maker_address: user.scwAddress as string
        });

        console.log("Trades Response:", JSON.stringify(trades, null, 2));

        if (trades.length === 0) {
            console.log("Trying without maker_address (Mock check)...");
            const trades2 = await clobClient.getTrades({});
            console.log("Trades (No Params) Response Length:", trades2.length);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
