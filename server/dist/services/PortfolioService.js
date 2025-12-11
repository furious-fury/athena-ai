import { prisma } from "../config/database.js";
import { Portfolio } from "../models/Portfolio.js";
import { Side } from "../generated/prisma/client.js";
import { get_positions, get_balance } from "../tools/polymarket.js";
export class PortfolioService {
    // ... existing methods
    /**
     * Take a snapshot of the user's current portfolio value (Cash + Positions)
     */
    static async takeSnapshot(userId) {
        try {
            const [balanceObj, positions] = await Promise.all([
                PortfolioService.getUserBalance(userId),
                PortfolioService.getAllUserPositions(userId)
            ]);
            const cashBalance = parseFloat(balanceObj.usdc || "0");
            const positionsValue = positions.reduce((sum, p) => sum + (p.exposure || 0), 0);
            const totalValue = cashBalance + positionsValue;
            await prisma.portfolioSnapshot.create({
                data: {
                    userId,
                    cashBalance,
                    positionsValue,
                    totalValue
                }
            });
            return { cashBalance, positionsValue, totalValue };
        }
        catch (error) {
            console.error("takeSnapshot failed:", error);
            return null;
        }
    }
    /**
     * Get portfolio history for chart
     */
    static async getHistory(userId) {
        // Fetch existing history
        const history = await prisma.portfolioSnapshot.findMany({
            where: { userId },
            orderBy: { timestamp: 'asc' },
            take: 168 // Approx 1 week of hourly data
        });
        // 1. Check if we need a new snapshot (Lazy Tracking)
        // If no history, OR last snapshot > 1 hour ago
        const lastSnapshot = history[history.length - 1];
        const now = new Date();
        const shouldSnapshot = !lastSnapshot || (now.getTime() - lastSnapshot.timestamp.getTime() > 60 * 60 * 1000);
        if (shouldSnapshot) {
            // Take snapshot in background (or await if we want fresh data immediately)
            // Awaiting for better UX on first load
            const newSnap = await PortfolioService.takeSnapshot(userId);
            if (newSnap) {
                // Add to returned list (mock id/timestamp for speed)
                history.push({
                    id: "temp",
                    userId,
                    timestamp: now,
                    cashBalance: newSnap.cashBalance,
                    positionsValue: newSnap.positionsValue,
                    totalValue: newSnap.totalValue
                });
            }
        }
        return history.map(h => ({
            time: h.timestamp.toISOString(),
            value: h.totalValue
        }));
    }
    // ... existing methods
    /**
     * Update a user's position after a trade.
     * Returns the updated position including PnL calculation.
     */
    static async updatePosition(userId, agentId, marketId, side, quantity, price, currentPrice, outcome, marketTitle) {
        return await Portfolio.updatePositionAfterTrade(userId, agentId, marketId, side, quantity, price, currentPrice, outcome, marketTitle);
    }
    /**
     * Save executed trade details for history/logging
     */
    static async saveTrade(trade) {
        return await Portfolio.saveTrade(trade);
    }
    /**
     * Fetch current positions for a user or agent from Polymarket API
     */
    static async getAllUserPositions(userId) {
        // Fetch from Gamma API via polymarket tool
        const apiPositions = await get_positions(userId); // Ensure this is imported
        // Map to frontend expected format
        // Map to frontend expected format
        return apiPositions.map((p) => ({
            id: p.asset || p.conditionId || Math.random().toString(),
            userId,
            marketId: p.asset || p.conditionId || "unknown", // Data API doesn't return 'market' ID, use asset/condition
            marketTitle: p.title || "Unknown Market",
            icon: p.icon, // Map icon
            outcome: p.outcome || "YES",
            shares: Number(p.size || 0),
            avgEntryPrice: Number(p.avgPrice || 0), // Data API uses avgPrice
            initialValue: Number(p.initialValue || 0), // Map initialValue (Cost Basis)
            exposure: Number(p.currentValue || 0), // Data API uses currentValue
            pnl: Number(p.cashPnl || 0), // Cash PnL
            percentPnl: Number(p.percentPnl || 0), // Percentage PnL
            currentPrice: Number(p.curPrice || 0)
        }));
    }
    /**
     * Fetch user balance (USDC & POL)
     */
    static async getUserBalance(userId) {
        return await get_balance(userId);
    }
    /**
     * Fetch PnL for a specific market or overall
     */
    static async getPnL(userId, marketId) {
        // ... (rest currently placeholder)
        return 0;
    }
}
//# sourceMappingURL=PortfolioService.js.map