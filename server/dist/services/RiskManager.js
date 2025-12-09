import { prisma } from "../config/database.js";
import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";
export class RiskManager {
    /**
     * Validate a trade against all risk limits
     */
    static async validateTrade(request) {
        const { userId, marketId, amount } = request;
        // 1. Get user's risk limits
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                maxTradeAmount: true,
                maxMarketExposure: true,
                maxTotalExposure: true,
                tradeCooldownSeconds: true,
            },
        });
        if (!user) {
            return { allowed: false, reason: "User not found" };
        }
        // 2. Check per-trade limit
        if (amount > user.maxTradeAmount) {
            logger.warn(`Trade blocked for ${userId}: amount ${amount} exceeds max ${user.maxTradeAmount}`);
            return {
                allowed: false,
                reason: `Trade amount ($${amount}) exceeds your limit ($${user.maxTradeAmount})`,
            };
        }
        // 3. Check cooldown period
        const cooldownCheck = await this.checkCooldown(userId, user.tradeCooldownSeconds);
        if (!cooldownCheck.allowed) {
            return cooldownCheck;
        }
        // 4. Check market-specific exposure
        const marketExposureCheck = await this.checkMarketExposure(userId, marketId, amount, user.maxMarketExposure);
        if (!marketExposureCheck.allowed) {
            return marketExposureCheck;
        }
        // 5. Check total exposure across all markets
        const totalExposureCheck = await this.checkTotalExposure(userId, amount, user.maxTotalExposure);
        if (!totalExposureCheck.allowed) {
            return totalExposureCheck;
        }
        // All checks passed
        return { allowed: true };
    }
    /**
     * Check if user is within cooldown period
     */
    static async checkCooldown(userId, cooldownSeconds) {
        const lastTradeKey = `user:${userId}:lastTrade`;
        const lastTradeTime = await redis.get(lastTradeKey);
        if (lastTradeTime) {
            const timeSinceLastTrade = Date.now() - parseInt(lastTradeTime);
            const cooldownMs = cooldownSeconds * 1000;
            if (timeSinceLastTrade < cooldownMs) {
                const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastTrade) / 1000);
                logger.warn(`Trade blocked for ${userId}: cooldown active (${remainingSeconds}s remaining)`);
                return {
                    allowed: false,
                    reason: `Cooldown active. Wait ${remainingSeconds} seconds before next trade.`,
                };
            }
        }
        return { allowed: true };
    }
    /**
     * Check market-specific exposure limit
     */
    static async checkMarketExposure(userId, marketId, amount, maxMarketExposure) {
        const currentPosition = await prisma.position.findUnique({
            where: {
                userId_marketId: { userId, marketId },
            },
            select: { exposure: true },
        });
        const currentExposure = currentPosition?.exposure || 0;
        const newExposure = currentExposure + amount;
        if (newExposure > maxMarketExposure) {
            logger.warn(`Trade blocked for ${userId}: market ${marketId} exposure would be ${newExposure}, max is ${maxMarketExposure}`);
            return {
                allowed: false,
                reason: `Market exposure limit ($${maxMarketExposure}) would be exceeded. Current: $${currentExposure}`,
            };
        }
        return { allowed: true };
    }
    /**
     * Check total exposure across all markets
     */
    static async checkTotalExposure(userId, amount, maxTotalExposure) {
        const positions = await prisma.position.findMany({
            where: { userId },
            select: { exposure: true },
        });
        const currentTotalExposure = positions.reduce((sum, pos) => sum + pos.exposure, 0);
        const newTotalExposure = currentTotalExposure + amount;
        if (newTotalExposure > maxTotalExposure) {
            logger.warn(`Trade blocked for ${userId}: total exposure would be ${newTotalExposure}, max is ${maxTotalExposure}`);
            return {
                allowed: false,
                reason: `Total exposure limit ($${maxTotalExposure}) would be exceeded. Current: $${currentTotalExposure}`,
            };
        }
        return { allowed: true };
    }
    /**
     * Record a successful trade (update cooldown)
     */
    static async recordTrade(userId) {
        const lastTradeKey = `user:${userId}:lastTrade`;
        await redis.set(lastTradeKey, Date.now().toString(), { EX: 86400 }); // 24h expiry
        logger.info(`Recorded trade for user ${userId}`);
    }
}
//# sourceMappingURL=RiskManager.js.map