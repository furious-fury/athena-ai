import { Router } from "express";
import { prisma } from "../config/database.js";
import { logger } from "../config/logger.js";
import { ethers } from "ethers";
const router = Router();
/**
 * POST /api/user/settings
 * Get user's risk limits and settings
 */
router.post("/settings", async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                maxTradeAmount: true,
                maxMarketExposure: true,
                maxTotalExposure: true,
                tradeCooldownSeconds: true,
                scwAddress: true,
                scwOwnerPrivateKey: true // Need this to derive EOA
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Backward compatibility for Frontend:
        // If Proxy (scwAddress) exists, use it.
        // If NOT, derive the EOA (Bot Wallet) address so UI shows "Initialized".
        let displayAddress = user.scwAddress;
        if (!displayAddress && user.scwOwnerPrivateKey) {
            try {
                const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");
                const wallet = new ethers.Wallet(user.scwOwnerPrivateKey, provider);
                displayAddress = wallet.address;
                // console.log("Derived EOA for UI:", displayAddress);
            }
            catch (err) {
                console.error("Failed to derive EOA for UI", err);
            }
        }
        res.json({
            ...user,
            scwOwnerPrivateKey: undefined, // Do not leak key
            proxyAddress: displayAddress
        });
    }
    catch (error) {
        logger.error({ error }, "Failed to fetch user settings");
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});
/**
 * PUT /api/user/settings
 * Update user's risk limits
 */
router.put("/settings", async (req, res) => {
    try {
        const { userId, maxTradeAmount, maxMarketExposure, maxTotalExposure, tradeCooldownSeconds } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        const updateData = {};
        if (maxTradeAmount !== undefined)
            updateData.maxTradeAmount = parseFloat(maxTradeAmount);
        if (maxMarketExposure !== undefined)
            updateData.maxMarketExposure = parseFloat(maxMarketExposure);
        if (maxTotalExposure !== undefined)
            updateData.maxTotalExposure = parseFloat(maxTotalExposure);
        if (tradeCooldownSeconds !== undefined)
            updateData.tradeCooldownSeconds = parseInt(tradeCooldownSeconds);
        const updated = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                maxTradeAmount: true,
                maxMarketExposure: true,
                maxTotalExposure: true,
                tradeCooldownSeconds: true,
            },
        });
        logger.info({ userId, updateData }, "User settings updated");
        res.json(updated);
    }
    catch (error) {
        logger.error({ error }, "Failed to update user settings");
        res.status(500).json({ error: "Failed to update settings" });
    }
});
// Obsolete /proxy-wallet route removed (replaced by /proxy/create)
/**
 * PUT /api/user/credentials
 * Update user's derived API credentials (API Key, Secret, Passphrase)
 */
router.put("/credentials", async (req, res) => {
    try {
        const { userId, apiKey, apiSecret, apiPassphrase } = req.body;
        if (!userId || !apiKey || !apiSecret || !apiPassphrase) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                apiKey,
                apiSecret,
                apiPassphrase
            },
            select: {
                id: true,
                walletAddress: true
            }
        });
        logger.info({ userId }, "User API credentials updated");
        res.json({ success: true, message: "Credentials stored successfully" });
    }
    catch (error) {
        logger.error({ error }, "Failed to update user credentials");
        res.status(500).json({ error: "Failed to update credentials" });
    }
});
import { createProxyWallet, getProxyWallet, exportProxyWallet, withdrawFunds, syncDeposits } from "../controllers/proxy.controller.js";
/**
 * POST /api/user/proxy/create
 * Generate a new server-managed proxy wallet for the user
 */
router.post("/proxy/create", createProxyWallet);
/**
 * POST /api/user/proxy/sync
 * Manually trigger a blockchain scan for deposits
 */
router.post("/proxy/sync", syncDeposits);
/**
 * GET /api/user/proxy
 * Get user's server-managed proxy wallet details
 */
router.get("/proxy", getProxyWallet);
/**
 * GET /api/user/proxy/export
 * Retrieve the decrypted proxy private key
 */
router.get("/proxy/export", exportProxyWallet);
/**
 * POST /api/user/proxy/withdraw
 * Withdraw funds from proxy to main wallet
 */
router.post("/proxy/withdraw", withdrawFunds);
import { ActivityController } from "../controllers/activity.controller.js";
/**
 * GET /api/user/activity/:userId
 * Fetch wallet generic activity (deposits/withdrawals)
 */
router.get("/activity/:userId", ActivityController.getUserActivity);
/**
 * POST /api/user/activity/log
 * Manually log an activity (e.g. from frontend deposit)
 */
router.post("/activity/log", ActivityController.logActivity);
export default router;
//# sourceMappingURL=user.routes.js.map