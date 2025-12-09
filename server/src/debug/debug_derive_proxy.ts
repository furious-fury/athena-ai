
import "dotenv/config";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { ClobClient } from "@polymarket/clob-client";

const connectionString = `${process.env.DATABASE_URL}`;

async function main() {
    console.log("--- Debugging Key <-> Proxy Relationship ---");
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });

    try {
        await prisma.$connect();
        const userId = "cmixw8l8j0000fgiyknopjqfe";
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.scwOwnerPrivateKey) throw new Error("User key not found");

        const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");
        const wallet = new ethers.Wallet(user.scwOwnerPrivateKey, provider);

        console.log(`EOA (Signer): ${wallet.address}`);

        // Use logic similar to ClobClient to derive/check header
        // Or if using ClobClient, it might fetch from API
        // But better to check what the API *thinks* this EOA is associated with.

        // We can't easily ask "What is my proxy?" via ClobClient without auth headers, 
        // but checking headers derivation might help.

        // Actually, if we just try to GET /user/profile or similar if possible (not exposed easily)
        // Let's print what was in the DB BEFORE the update (we saw it in logs: 0x04E0...)

        console.log(`User says Proxy is: 0xA93a5464647Ea593F863061f676C21dA2E8Db953`);

        // Let's check funds on the EOA itself again, just in case user funded appropriate EOA
        const pol = await provider.getBalance(wallet.address);
        console.log(`EOA POL Balance: ${ethers.utils.formatEther(pol)}`);

        // Native USDC on EOA
        const usdcNative = new ethers.Contract("0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", ["function balanceOf(address) view returns (uint256)"], provider);
        const balNative = await usdcNative.balanceOf(wallet.address);
        console.log(`EOA Native USDC: ${ethers.utils.formatUnits(balNative, 6)}`);

        // Bridged USDC on EOA
        const usdcBridged = new ethers.Contract("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", ["function balanceOf(address) view returns (uint256)"], provider);
        const balBridged = await usdcBridged.balanceOf(wallet.address);
        console.log(`EOA Bridged USDC: ${ethers.utils.formatUnits(balBridged, 6)}`);

        console.log(`\nPossible Explanations:`);
        console.log(`1. The Private Key we have (${wallet.address}) is NOT the owner of 0xA93...`);
        console.log(`2. 0xA93... is correct but on a different chain? (Unlikely for Polymarket)`);
        console.log(`3. 0xA93... actually has 0 funds and UI is confusing?`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
