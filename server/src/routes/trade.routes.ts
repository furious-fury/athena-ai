import { Router } from "express";
import { TradeService, type TradeRequest } from "../services/TradeService.js";
import { prisma } from "../config/database.js";

export const tradeRouter = Router();

// POST /api/trade/agent
tradeRouter.post("/agent", async (req, res) => {
    try {
        const tradeRequest: TradeRequest = req.body;
        const result = await TradeService.executeAgentTrade(tradeRequest);
        res.json({ success: true, result });
    } catch (err) {
        console.error("Trade error:", err);
        res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
    }
});
// GET /api/trade/history/:userId
tradeRouter.get("/history/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const { get_trades } = await import("../tools/polymarket.js");

        const trades = await get_trades(userId);
        res.json({ success: true, trades });
    } catch (err) {
        console.error("Trade history error:", err);
        res.status(500).json({ success: false, error: "Failed to fetch trade history" });
    }
});
// GET /api/trade/history-address/:address
tradeRouter.get("/history-address/:address", async (req, res) => {
    try {
        const address = req.params.address;

        // Try Cache First
        const cached = await prisma.trackedWallet.findFirst({
            where: { address },
            select: { cachedTrades: true, lastUpdated: true }
        });

        if (cached?.cachedTrades && cached.lastUpdated && (Date.now() - cached.lastUpdated.getTime() < 120000)) {
            // console.log(`[API] Serving cached trades for ${address}`);
            return res.json({ success: true, trades: cached.cachedTrades });
        }

        const { get_trades_by_address } = await import("../tools/polymarket.js");

        const trades = await get_trades_by_address(address);

        // Update cache implicitly? No, let service handle or update here if we are nice.
        // Let's update here to "heal" the cache on miss
        if (trades.length > 0) {
            try {
                await prisma.trackedWallet.updateMany({
                    where: { address },
                    data: { cachedTrades: trades as any, lastUpdated: new Date() }
                });
            } catch (e) { }
        }

        res.json({ success: true, trades });
    } catch (err) {
        console.error("Address history error:", err);
        res.status(500).json({ success: false, error: "Failed to fetch address history" });
    }
});
// GET /api/trade/positions-address/:address
tradeRouter.get("/positions-address/:address", async (req, res) => {
    try {
        const address = req.params.address;

        // Try Cache First
        const cached = await prisma.trackedWallet.findFirst({
            where: { address },
            select: { cachedPositions: true, lastUpdated: true }
        });

        if (cached?.cachedPositions && cached.lastUpdated && (Date.now() - cached.lastUpdated.getTime() < 120000)) {
            // console.log(`[API] Serving cached positions for ${address}`);
            return res.json({ success: true, positions: cached.cachedPositions });
        }

        const { get_positions_by_address } = await import("../tools/polymarket.js");

        const positions = await get_positions_by_address(address);

        // Heal cache
        if (positions.length > 0) {
            try {
                await prisma.trackedWallet.updateMany({
                    where: { address },
                    data: { cachedPositions: positions as any, lastUpdated: new Date() }
                });
            } catch (e) { }
        }
        res.json({ success: true, positions });
    } catch (err) {
        console.error("Address positions error:", err);
        res.status(500).json({ success: false, error: "Failed to fetch address positions" });
    }
});
// POST /api/trade/close
tradeRouter.post("/close", async (req, res) => {
    try {
        const { userId, marketId, outcome } = req.body;

        // Lazy import
        const { close_position } = await import("../tools/polymarket.js");

        const result = await close_position(userId, marketId, outcome);
        res.json({ success: true, result });
    } catch (err) {
        console.error("Close trade error:", err);
        res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Failed to close position" });
    }
});
