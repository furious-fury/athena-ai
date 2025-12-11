import { prisma } from '../config/database.js';
import { ethers } from 'ethers';
import { SmartWalletService } from '../services/smartWallet.service.js';
import { redis } from '../config/redis.js';
// Helper to encrypt key (Placeholder for now - In prod use real encryption)
const encryptKey = (key) => key;
import { ClobClient } from "@polymarket/clob-client";
export const importProxyWallet = async (req, res) => {
    try {
        const { userId, privateKey, proxyAddress } = req.body;
        if (!userId || !privateKey || !proxyAddress) {
            return res.status(400).json({ error: "Missing required fields: userId, privateKey, proxyAddress" });
        }
        // 1. Validate User
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // 2. Validate Private Key & Proxy Format
        let wallet;
        try {
            wallet = new ethers.Wallet(privateKey);
        }
        catch (e) {
            return res.status(400).json({ error: "Invalid Private Key" });
        }
        if (!ethers.utils.isAddress(proxyAddress)) {
            return res.status(400).json({ error: "Invalid Proxy Address" });
        }
        console.log(`[Proxy] Importing for ${userId}. Signer: ${wallet.address} | Proxy: ${proxyAddress}`);
        // 3. Save Credentials
        // NOTE: In production, scwOwnerPrivateKey MUST be encrypted. 
        // Current implementation uses a placeholder encryptKey function.
        await prisma.user.update({
            where: { id: userId },
            data: {
                scwAddress: proxyAddress,
                scwOwnerPrivateKey: encryptKey(privateKey),
                // walletAddress: wallet.address // REMOVED: Do not overwrite the connected Solana Address with the EVM Signer Address
                // Preserving the Solana Identity allowing subsequent logins to succeed.
            }
        });
        // 4. Auto-Setup API Keys (Ensure Trade Readiness)
        console.log(`[Proxy] Setting up API Keys...`);
        try {
            // 137 = Polygon
            const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");
            const signer = new ethers.Wallet(privateKey, provider);
            // Init with Proxy configuration
            const clobClient = new ClobClient("https://clob.polymarket.com", 137, signer, undefined, 2, // signatureType 2 (Proxy)
            proxyAddress);
            // Create Keys
            const keys = await clobClient.createApiKey();
            if (keys && keys.key) {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        apiKey: keys.key,
                        apiSecret: keys.secret,
                        apiPassphrase: keys.passphrase
                    }
                });
                console.log(`[Proxy] API Keys Created & Saved.`);
            }
        }
        catch (apiError) {
            console.warn(`[Proxy] API Key Setup Warning: ${apiError.message}`);
            // Don't fail the whole request, just warn. User can trade later or keys might already exist.
        }
        res.status(200).json({
            message: "Wallet Imported Successfully",
            address: proxyAddress,
            scwAddress: proxyAddress,
            signer: wallet.address
        });
    }
    catch (error) {
        console.error("Error importing wallet:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const getProxyWallet = async (req, res) => {
    try {
        const { userId } = req.query; // or params
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: "UserId is required" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { scwAddress: true }
        });
        if (!user || !user.scwAddress) {
            return res.status(404).json({ error: "No smart account found" });
        }
        // Cache Layer
        const CACHE_KEY = `balance:${userId}`;
        const cached = await redis.get(CACHE_KEY);
        if (cached) {
            return res.json(JSON.parse(cached));
        }
        // Fetch Real Balance from Polygon
        let balance = 0;
        try {
            const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");
            const nativeUsdcAddress = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
            const bridgedUsdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
            const abi = ["function balanceOf(address) view returns (uint256)"];
            const nativeContract = new ethers.Contract(nativeUsdcAddress, abi, provider);
            const bridgedContract = new ethers.Contract(bridgedUsdcAddress, abi, provider);
            const [nativeRaw, bridgedRaw] = await Promise.all([
                nativeContract.balanceOf(user.scwAddress).catch(() => ethers.BigNumber.from(0)),
                bridgedContract.balanceOf(user.scwAddress).catch(() => ethers.BigNumber.from(0))
            ]);
            const nativeBal = parseFloat(ethers.utils.formatUnits(nativeRaw, 6));
            const bridgedBal = parseFloat(ethers.utils.formatUnits(bridgedRaw, 6));
            console.log(`[Balance] User ${userId} | Native: ${nativeBal} | Bridged: ${bridgedBal} (Live Fetch)`);
            balance = nativeBal + bridgedBal;
        }
        catch (rpcError) {
            console.warn(`[Proxy] Failed to fetch balance for ${user.scwAddress}`, rpcError);
            // Fallback to 0 if RPC fails, don't crash endpoint
        }
        const data = {
            address: user.scwAddress,
            balance: balance
        };
        // Cache for 30 seconds
        await redis.set(CACHE_KEY, JSON.stringify(data), { EX: 30 });
        res.json(data);
    }
    catch (error) {
        console.error("Error fetching smart account:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const exportProxyWallet = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: "UserId is required" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { scwOwnerPrivateKey: true }
        });
        if (!user || !user.scwOwnerPrivateKey) {
            return res.status(404).json({ error: "No private key found" });
        }
        // Return the owner key so they can control the SCW externally if needed
        res.json({ privateKey: user.scwOwnerPrivateKey });
    }
    catch (error) {
        console.error("Error exporting key:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const withdrawFunds = async (req, res) => {
    try {
        const { userId, amount, currency = "USDC" } = req.body;
        if (!userId || !amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { walletAddress: true, scwAddress: true, scwOwnerPrivateKey: true }
        });
        if (!user || (!user.scwAddress && !user.scwOwnerPrivateKey)) {
            return res.status(404).json({ error: "User or wallet key not found" });
        }
        console.log(`[Withdraw] initiating withdraw for ${userId}. Mode: ${user.scwAddress ? 'PROXY (Gasless)' : 'EOA (Standard)'}`);
        const destination = user.walletAddress;
        let txHash;
        // MODE 1: Standard EOA Transfer (Fallback)
        if (!user.scwAddress && user.scwOwnerPrivateKey) {
            const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");
            const wallet = new ethers.Wallet(user.scwOwnerPrivateKey, provider);
            if (currency === "POL" || currency === "MATIC") {
                const value = ethers.utils.parseEther(amount.toString());
                const tx = await wallet.sendTransaction({
                    to: destination,
                    value: value
                });
                txHash = tx.hash;
            }
            else {
                // ERC20 Transfer (USDC)
                const usdcAddress = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
                const amountUnits = ethers.utils.parseUnits(amount.toString(), 6);
                const contract = new ethers.Contract(usdcAddress, [
                    "function transfer(address to, uint256 amount) returns (bool)"
                ], wallet);
                const tx = await contract.transfer(destination, amountUnits, {
                    // Add slight gas buffer for Polygon
                    gasLimit: 100000,
                    maxPriorityFeePerGas: ethers.utils.parseUnits("35", "gwei"),
                    maxFeePerGas: ethers.utils.parseUnits("50", "gwei")
                });
                txHash = tx.hash;
            }
        }
        else if (user.scwAddress && user.scwOwnerPrivateKey) {
            // MODE 2: Proxy Smart Wallet (Pimlico)
            if (currency === "POL" || currency === "MATIC") {
                const value = ethers.utils.parseEther(amount.toString());
                txHash = await SmartWalletService.sendTransaction(user.scwOwnerPrivateKey, destination, BigInt(value.toString()), "0x");
            }
            else {
                const usdcAddress = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
                const amountUnits = ethers.utils.parseUnits(amount.toString(), 6);
                const iface = new ethers.utils.Interface([
                    "function transfer(address to, uint256 amount) returns (bool)"
                ]);
                const data = iface.encodeFunctionData("transfer", [destination, amountUnits]);
                txHash = await SmartWalletService.sendTransaction(user.scwOwnerPrivateKey, usdcAddress, BigInt(0), data);
            }
        }
        console.log(`[Withdraw] SCW Transaction sent: ${txHash}`);
        // Log Withdrawal Activity
        await prisma.activity.create({
            data: {
                userId,
                type: "WITHDRAWAL",
                amount: Number(amount),
                txId: txHash
            }
        });
        return res.json({ success: true, txHash });
    }
    catch (error) {
        console.error("Withdraw error:", error);
        const reason = error.reason || error.message || "Unknown error";
        res.status(500).json({ error: "Withdraw failed: " + reason });
    }
};
export const syncDeposits = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId)
            return res.status(400).json({ error: "UserId is required" });
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { scwAddress: true }
        });
        if (!user || !user.scwAddress) {
            return res.status(404).json({ error: "Proxy wallet not found" });
        }
        // 1. Fetch recent transfers from Blockchain
        const transfers = await SmartWalletService.getUSDCTransfers(user.scwAddress);
        const newDepositHashes = [];
        // 2. Insert into Activity DB if not exists
        for (const tx of transfers) {
            // Check if we already logged this tx
            const exists = await prisma.activity.findFirst({
                where: { txId: tx.txHash, type: "DEPOSIT" }
            });
            if (!exists) {
                // Convert BigInt to Number (USDC has 6 decimals)
                const amount = Number(tx.amount) / 1000000;
                await prisma.activity.create({
                    data: {
                        userId,
                        type: "DEPOSIT",
                        amount: amount,
                        txId: tx.txHash,
                        timestamp: new Date()
                    }
                });
                newDepositHashes.push(tx.txHash);
            }
        }
        res.json({ success: true, newDeposits: newDepositHashes.length, newDepositHashes });
    }
    catch (error) {
        console.error("Sync error:", error);
        res.status(500).json({ error: "Failed to sync deposits" });
    }
};
//# sourceMappingURL=proxy.controller.js.map