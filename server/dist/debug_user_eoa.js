import "dotenv/config";
import { ethers } from "ethers";
import { ClobClient } from "@polymarket/clob-client";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
const connectionString = `${process.env.DATABASE_URL}`;
async function main() {
    console.log("--- Post-Onboarding Debug ---");
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });
    // User Provided Real Proxy
    const realProxyAddress = "0x917EAEE23635ABD65E04F6Fc97Fa0adbFC14ca7B";
    try {
        await prisma.$connect();
        const userId = "cmixw8l8j0000fgiyknopjqfe";
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.scwOwnerPrivateKey)
            throw new Error("User/Key not found");
        const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(user.scwOwnerPrivateKey.trim(), provider);
        console.log(`EOA: ${wallet.address}`);
        console.log(`Proxy: ${realProxyAddress}`);
        const chainId = 137;
        // TEST 1: Type 0 (EOA) - Create API Key
        console.log("\n[TEST 1] Type 0 (EOA) - createApiKey");
        try {
            const clob0 = new ClobClient("https://clob.polymarket.com", chainId, wallet, undefined, 0);
            const k0 = await clob0.createApiKey();
            console.log("SUCCESS Type 0:", k0);
        }
        catch (e) {
            console.log("FAILED Type 0:", e?.response?.data || e.message);
        }
        // TEST 2: Type 1 (Poly Proxy) - Create API Key
        console.log("\n[TEST 2] Type 1 (Poly Proxy) - createApiKey");
        try {
            const clob1 = new ClobClient("https://clob.polymarket.com", chainId, wallet, undefined, 1, realProxyAddress);
            const k1 = await clob1.createApiKey();
            console.log("SUCCESS Type 1:", k1);
        }
        catch (e) {
            console.log("FAILED Type 1:", e?.response?.data || e.message);
        }
        // TEST 3: Type 2 (Gnosis Safe) - Create API Key
        console.log("\n[TEST 3] Type 2 (Gnosis Safe) - createApiKey");
        try {
            const clob2 = new ClobClient("https://clob.polymarket.com", chainId, wallet, undefined, 2, realProxyAddress);
            const k2 = await clob2.createApiKey();
            console.log("SUCCESS Type 2:", k2);
        }
        catch (e) {
            console.log("FAILED Type 2:", e?.response?.data || e.message);
        }
    }
    catch (err) {
        console.error("CRITICAL:", err);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=debug_user_eoa.js.map