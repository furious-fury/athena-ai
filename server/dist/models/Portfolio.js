import { redis } from "../config/redis.js";
import { Side } from "../generated/prisma/client.js";
import { prisma } from "../config/database.js";
export class PortfolioRedis {
    static queueKey(agentId) {
        return `agent:${agentId}:jobs`;
    }
    /**
     * Cache a user's position in Redis
     */
    static async setPosition(userId, marketId, data) {
        const key = `position:${userId}:${marketId}`;
        await redis.set(key, JSON.stringify(data));
    }
    /**
     * Retrieve a user's cached position
     */
    static async getPosition(userId, marketId) {
        const key = `position:${userId}:${marketId}`;
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
    }
    /**
     * Push a new agent job into Redis queue (SHARED QUEUE)
     */
    static async enqueueAgentJob(agentId, job) {
        // We ignore agentId for the key, pushing to global queue
        const serializedJob = JSON.stringify(job);
        await redis.lPush(this.SHARED_QUEUE_KEY, serializedJob);
    }
    /**
     * Pop the next agent job from Redis queue (SHARED QUEUE)
     */
    static async dequeueAgentJob(workerId) {
        // workerId is just for logging/tracking if needed, we pop from shared queue
        const serializedJob = await redis.rPop(this.SHARED_QUEUE_KEY);
        return serializedJob ? JSON.parse(serializedJob) : null;
    }
    /**
     * Clear queue
     */
    static async clearAgentQueue(agentId) {
        await redis.del(this.SHARED_QUEUE_KEY);
    }
}
PortfolioRedis.SHARED_QUEUE_KEY = "global_agent_job_queue";
export class Portfolio {
    // Update portfolio after a trade
    static async updateAfterTrade(params) {
        const { userId, agentId, marketId, amount, side, price, txId, outcome } = params;
        // 1️⃣ Get current position for this market
        let position = await prisma.position.findFirst({
            where: { userId, marketId },
        });
        const tradeQuantity = amount * (side === "BUY" ? 1 : -1);
        if (position) {
            // 2️⃣ Update existing position
            const newQuantity = position.shares + tradeQuantity;
            const newAvgPrice = newQuantity !== 0
                ? ((position.avgEntryPrice ?? 0) * position.shares + price * tradeQuantity) / newQuantity
                : 0;
            position = await prisma.position.update({
                where: { id: position.id },
                data: {
                    shares: newQuantity,
                    avgEntryPrice: newAvgPrice,
                    exposure: Math.abs(newQuantity * (newAvgPrice ?? 0)), // recalc exposure
                },
            });
        }
        else {
            // 3️⃣ Create new position
            position = await prisma.position.create({
                data: {
                    userId,
                    marketId,
                    outcome, // Added outcome
                    shares: tradeQuantity,
                    avgEntryPrice: price,
                    exposure: amount,
                },
            });
        }
        // 4️⃣ Log trade in Trade table
        await prisma.trade.create({
            data: {
                userId,
                agentId,
                marketId,
                outcome,
                amount,
                side,
                price,
                txId,
            },
        });
        return position;
    }
    // Get user wallet
    static async getWallet(userId) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                walletAddress: true,
                apiKey: true,
                apiSecret: true,
                apiPassphrase: true,
                scwAddress: true,
                scwOwnerPrivateKey: true
            },
        });
    }
    // Save a trade in DB
    static async saveTrade(trade) {
        return prisma.trade.create({ data: trade });
    }
    // Get all positions for user
    static async getAllUserPositions(userId) {
        return prisma.position.findMany({ where: { userId } });
    }
    // Get user exposure
    static async getUserExposure(userId) {
        const positions = await prisma.position.findMany({ where: { userId } });
        const exposure = positions.reduce((acc, pos) => acc + pos.shares * (pos.avgEntryPrice ?? 0), 0);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const balance = user?.balance || 0;
        return { exposure: balance ? exposure / balance : 0 };
    }
    // Update position after trade and recalc PnL
    static async updatePositionAfterTrade(userId, agentId, marketId, side, quantity, price, currentPrice, outcome, marketTitle // Added
    ) {
        let position = await prisma.position.findUnique({
            where: { userId_marketId: { userId, marketId } },
        });
        if (position) {
            position = await prisma.position.update({
                where: { userId_marketId: { userId, marketId } },
                data: {
                    shares: position.shares + quantity,
                    avgEntryPrice: price,
                    exposure: Math.abs((position.shares + quantity) * price),
                    ...(marketTitle ? { marketTitle } : {}), // Only update if provided
                },
            });
        }
        else {
            position = await prisma.position.create({
                data: {
                    userId,
                    marketId,
                    marketTitle: marketTitle || null, // Explicit null if undefined
                    outcome,
                    shares: quantity,
                    avgEntryPrice: price,
                    exposure: quantity * price,
                },
            });
        }
        // Optional: log trade
        await prisma.trade.create({
            data: {
                userId,
                agentId,
                marketId,
                outcome,
                amount: quantity,
                price,
                side,
                txId: `${Date.now()}`, // temporary txId if not passed
            },
        });
        return position;
    }
}
//# sourceMappingURL=Portfolio.js.map