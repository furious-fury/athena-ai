
import "dotenv/config";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const NATIVE_USDC = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
const BRIDGED_USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const CTF_EXCHANGE_ADDRESS = "0x4bfb41d5b3570defd30c3975a9c70d529202fcae"; // Lowercase to avoid checksum errors

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
];

async function main() {
    console.log("--- Approving USDC for Trading ---");

    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });

    try {
        await prisma.$connect();
        const userId = "cmixw8l8j0000fgiyknopjqfe";
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.scwOwnerPrivateKey) {
            console.error("User or Key not found!");
            return;
        }

        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(user.scwOwnerPrivateKey.trim(), provider);
        console.log(`EOA Address: ${wallet.address}`);

        // Check POL (Gas)
        const polBal = await provider.getBalance(wallet.address);
        console.log(`Gas Balance (POL): ${ethers.utils.formatEther(polBal)}`);

        // Check USDC Balances
        const usdcNative = new ethers.Contract(NATIVE_USDC, ERC20_ABI, wallet);
        const usdcBridged = new ethers.Contract(BRIDGED_USDC, ERC20_ABI, wallet);

        const balNative = await usdcNative.balanceOf(wallet.address);
        const balBridged = await usdcBridged.balanceOf(wallet.address);

        console.log(`Native USDC: ${ethers.utils.formatUnits(balNative, 6)}`);
        console.log(`Bridged USDC: ${ethers.utils.formatUnits(balBridged, 6)}`);

        // Check Allowances
        const allowNative = await usdcNative.allowance(wallet.address, CTF_EXCHANGE_ADDRESS);
        const allowBridged = await usdcBridged.allowance(wallet.address, CTF_EXCHANGE_ADDRESS);

        console.log(`Native Allowance: ${ethers.utils.formatUnits(allowNative, 6)}`);
        console.log(`Bridged Allowance: ${ethers.utils.formatUnits(allowBridged, 6)}`);

        if (polBal.lt(ethers.utils.parseEther("0.1"))) {
            console.error("❌ ERROR: Insufficient Gas (POL). Please send ~1 POL to this address to pay for approval/trading.");
            return;
        }

        // Gas Overrides for Polygon (40-50 Gwei to be safe)
        const gasOptions = {
            maxFeePerGas: ethers.utils.parseUnits("50", "gwei"),
            maxPriorityFeePerGas: ethers.utils.parseUnits("40", "gwei")
        };

        // Approve whichever has balance AND low allowance
        if (balNative.gt(0)) {
            if (allowNative.lt(balNative)) {
                console.log(`Approving Native USDC on CTF Exchange...`);
                const tx = await usdcNative.approve(CTF_EXCHANGE_ADDRESS, ethers.constants.MaxUint256, gasOptions);
                console.log(`Tx Sent: ${tx.hash}`);
                await tx.wait();
                console.log("✅ Native USDC Approved");
            } else {
                console.log("✅ Native USDC Already Approved!");
            }
        }

        if (balBridged.gt(0)) {
            if (allowBridged.lt(balBridged)) {
                console.log(`Approving Bridged USDC on CTF Exchange...`);
                const tx = await usdcBridged.approve(CTF_EXCHANGE_ADDRESS, ethers.constants.MaxUint256, gasOptions);
                console.log(`Tx Sent: ${tx.hash}`);
                await tx.wait();
                console.log("✅ Bridged USDC Approved");
            } else {
                console.log("✅ Bridged USDC Already Approved!");
            }
        }

        if (balNative.eq(0) && balBridged.eq(0)) {
            console.log("⚠️ No USDC found to approve.");
        }

    } catch (error: any) {
        console.error("Error:", error.message || error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
