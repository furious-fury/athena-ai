import type { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { ethers } from 'ethers';
import { SmartWalletService } from '../services/smartWallet.service.js';

// Helper to encrypt key (Placeholder for now - In prod use real encryption)
const encryptKey = (key: string) => key;

export const createProxyWallet = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "UserId is required" });
        }

        // 1. Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Check if SCW already exists
        if (user.scwAddress) {
            return res.status(200).json({
                message: "Smart Account already exists",
                address: user.scwAddress, // Map to address for frontend
                scwAddress: user.scwAddress,
                exists: true
            });
        }

        // 3. Generate Pimlico Smart Account (ERC-4337)
        console.log(`[Proxy] Generating Pimlico Smart Account for user ${userId}...`);
        const scwData = await SmartWalletService.createOneClickAccount();
        console.log(`[Proxy] SCW Generated: ${scwData.address}`);

        await prisma.user.update({
            where: { id: userId },
            data: {
                scwAddress: scwData.address,
                scwOwnerPrivateKey: scwData.privateKey ? encryptKey(scwData.privateKey) : null
            }
        });

        res.status(201).json({
            message: "Smart Account created",
            address: scwData.address,
            scwAddress: scwData.address,
            exists: false
        });

    } catch (error) {
        console.error("Error creating smart account:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getProxyWallet = async (req: Request, res: Response) => {
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

        res.json({
            address: user.scwAddress,
            balance: 0 // Frontend often fetches real balance on-chain
        });

    } catch (error) {
        console.error("Error fetching smart account:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const exportProxyWallet = async (req: Request, res: Response) => {
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

    } catch (error) {
        console.error("Error exporting key:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const withdrawFunds = async (req: Request, res: Response) => {
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
            } else {
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

        } else if (user.scwAddress && user.scwOwnerPrivateKey) {
            // MODE 2: Proxy Smart Wallet (Pimlico)
            if (currency === "POL" || currency === "MATIC") {
                const value = ethers.utils.parseEther(amount.toString());
                txHash = await SmartWalletService.sendTransaction(
                    user.scwOwnerPrivateKey,
                    destination as any,
                    BigInt(value.toString()),
                    "0x"
                );
            } else {
                const usdcAddress = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
                const amountUnits = ethers.utils.parseUnits(amount.toString(), 6);

                const iface = new ethers.utils.Interface([
                    "function transfer(address to, uint256 amount) returns (bool)"
                ]);
                const data = iface.encodeFunctionData("transfer", [destination, amountUnits]);

                txHash = await SmartWalletService.sendTransaction(
                    user.scwOwnerPrivateKey,
                    usdcAddress as any,
                    BigInt(0),
                    data as any
                );
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

    } catch (error: any) {
        console.error("Withdraw error:", error);
        const reason = error.reason || error.message || "Unknown error";
        res.status(500).json({ error: "Withdraw failed: " + reason });
    }
};

export const syncDeposits = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: "UserId is required" });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { scwAddress: true }
        });

        if (!user || !user.scwAddress) {
            return res.status(404).json({ error: "Proxy wallet not found" });
        }

        // 1. Fetch recent transfers from Blockchain
        const transfers = await SmartWalletService.getUSDCTransfers(user.scwAddress as any);

        const newDepositHashes: string[] = [];

        // 2. Insert into Activity DB if not exists
        for (const tx of transfers) {
            // Check if we already logged this tx
            const exists = await prisma.activity.findFirst({
                where: { txId: tx.txHash, type: "DEPOSIT" }
            });

            if (!exists) {
                // Convert BigInt to Number (USDC has 6 decimals)
                const amount = Number(tx.amount) / 1_000_000;

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

    } catch (error) {
        console.error("Sync error:", error);
        res.status(500).json({ error: "Failed to sync deposits" });
    }
};
