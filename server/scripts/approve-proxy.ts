
import "dotenv/config";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { ClobClient, AssetType } from "@polymarket/clob-client";
import { SecurityService } from "../src/services/SecurityService.js";
import pg from 'pg';

// Setup DB
const globalForPg = global as any;
const pool = globalForPg.pgPool || new pg.Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const CTF_EXCHANGE = "0x4bfb41d5b3570defd30c3975a9c70d529202fcae";
const BRIDGED_USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address, address) view returns (uint256)",
    "function approve(address, uint256) returns (bool)"
];

async function main() {
    console.log("--- Checking PROXY Status & Enabling Trading ---");
    const userId = "cmj0wvx3z0000c0iy4kpt03hb"; // Target User

    try {
        await prisma.$connect();
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.scwOwnerPrivateKey) {
            console.error("User invalid or no EOA key found");
            return;
        }

        console.log(`User: ${user.walletAddress}`);

        const privateKey = await SecurityService.decrypt(user.scwOwnerPrivateKey, user.id);
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(privateKey.trim(), provider);

        if (!user.scwAddress) {
            console.error("No Proxy Address found on user record");
            return;
        }

        // Check Balances & Allowance
        const usdc = new ethers.Contract(BRIDGED_USDC, ERC20_ABI, provider);
        const balProxy = await usdc.balanceOf(user.scwAddress);
        const allowProxy = await usdc.allowance(user.scwAddress, CTF_EXCHANGE);

        console.log(`\n--- Proxy Status ---`);
        console.log(`💰 Balance: ${ethers.utils.formatUnits(balProxy, 6)} USDC`);
        console.log(`🔓 Allowance: ${ethers.utils.formatUnits(allowProxy, 6)} USDC`);

        if (balProxy.lt(ethers.utils.parseUnits("1", 6))) {
            console.warn("⚠️ Proxy has low/zero USDC balance.");
        }

        if (allowProxy.lt(balProxy) || allowProxy.eq(0)) {
            console.log("\n⚠️ Insufficient allowance. enabling trading...");

            const chainId = 137;
            const clobClient = new ClobClient(
                "https://clob.polymarket.com",
                chainId,
                wallet,
                user.apiKey && user.apiSecret && user.apiPassphrase ? {
                    key: user.apiKey,
                    secret: user.apiSecret,
                    passphrase: user.apiPassphrase
                } : undefined
            );

            // SYNC TIME & PATCH
            console.log("[TIME] ⏳ Syncing time with SDK...");
            const serverTimeSec = await clobClient.getServerTime();
            const serverTimeMs = serverTimeSec * 1000;
            const now = Date.now();
            const offset = serverTimeMs - now;
            console.log(`[TIME] Offset detected: ${offset}ms`);

            if (Math.abs(offset) > 2000) {
                console.log(`[TIME] ⚠️ Patching Date global...`);
                const OriginalDate = Date;
                // @ts-ignore
                global.Date = class extends OriginalDate {
                    constructor(...args: any[]) {
                        if (args.length === 0) {
                            return new OriginalDate(new OriginalDate().getTime() + offset);
                        } else {
                            // @ts-ignore
                            super(...args);
                        }
                    }
                    static now() { return new OriginalDate().getTime() + offset; }
                    static parse(s: string) { return OriginalDate.parse(s); }
                    // @ts-ignore
                    static UTC(...args: any[]) { return OriginalDate.UTC(...args); }
                };
            }

            console.log("🚀 Sending Approval Tx...");
            const txHash = await clobClient.updateBalanceAllowance({ asset_type: AssetType.COLLATERAL });
            console.log("✅ Allowance Updated! Tx:", txHash);

        } else {
            console.log("✅ Proxy is fully funded and approved.");
        }

    } catch (e: any) {
        console.error("Error:", e.message || e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
