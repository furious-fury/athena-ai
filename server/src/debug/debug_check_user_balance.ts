import "dotenv/config";
import { ethers } from "ethers";
import { prisma } from "../config/database.js";
import { SmartWalletService } from "../services/smartWallet.service.js";

async function main() {
    console.log("--- Debug User Balances (With Derivation) ---");

    // 1. Fetch Users
    const users = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${users.length} users.`);

    const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");

    const USDC_NATIVE = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
    const USDC_BRIDGED = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

    const usdcNative = new ethers.Contract(USDC_NATIVE, ["function balanceOf(address) view returns (uint256)"], provider);
    const usdcBridged = new ethers.Contract(USDC_BRIDGED, ["function balanceOf(address) view returns (uint256)"], provider);

    for (const user of users) {
        console.log(`\nUser ID: ${user.id}`);

        let eoaAddress = "N/A";
        let derivedProxy = "N/A";

        if (user.scwOwnerPrivateKey) {
            try {
                // 1. Get EOA
                const wallet = new ethers.Wallet(user.scwOwnerPrivateKey, provider);
                eoaAddress = wallet.address;

                // 2. Derive Proxy (SCW)
                const client = await SmartWalletService.getSmartAccountClient(user.scwOwnerPrivateKey);
                derivedProxy = client.account.address;

            } catch (e: any) { console.error("Error deriving addresses:", e.message); }
        }

        const dbScwAddress = user.scwAddress || "N/A";

        console.log(`EOA: ${eoaAddress}`);
        console.log(`DB SCW: ${dbScwAddress}`);
        console.log(`Derived SCW: ${derivedProxy}`);

        // Check EOA
        if (eoaAddress !== "N/A") {
            try {
                const n = await usdcNative.balanceOf(eoaAddress);
                const b = await usdcBridged.balanceOf(eoaAddress);
                const p = await provider.getBalance(eoaAddress);
                console.log(`[EOA] Native: ${ethers.utils.formatUnits(n, 6)} | Bridged: ${ethers.utils.formatUnits(b, 6)} | POL: ${ethers.utils.formatEther(p)}`);
            } catch (e) {
                console.log(`[EOA] Error fetching balance`);
            }
        }

        // Check Derived SCW
        if (derivedProxy !== "N/A") {
            try {
                const n = await usdcNative.balanceOf(derivedProxy);
                const b = await usdcBridged.balanceOf(derivedProxy);
                const p = await provider.getBalance(derivedProxy);
                console.log(`[Derived SCW] Native: ${ethers.utils.formatUnits(n, 6)} | Bridged: ${ethers.utils.formatUnits(b, 6)} | POL: ${ethers.utils.formatEther(p)}`);
            } catch (e) {
                console.log(`[Derived SCW] Error fetching balance`);
            }
        }
    }

    await prisma.$disconnect();
    // Force exit to ensure script doesn't hang
    process.exit(0);
}

main();
