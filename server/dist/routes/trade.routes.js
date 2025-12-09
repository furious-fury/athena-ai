import { Router } from "express";
import { TradeService } from "../services/TradeService.js";
export const tradeRouter = Router();
// POST /api/trade/agent
tradeRouter.post("/agent", async (req, res) => {
    try {
        const tradeRequest = req.body;
        const result = await TradeService.executeAgentTrade(tradeRequest);
        res.json({ success: true, result });
    }
    catch (err) {
        console.error("Trade error:", err);
        res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
    }
});
// GET /api/trade/history/:userId
tradeRouter.get("/history/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        // Need to import prisma to query trades
        const { prisma } = await import("../config/database.js");
        const trades = await prisma.trade.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50
        });
        res.json({ success: true, trades });
    }
    catch (err) {
        console.error("Trade history error:", err);
        // Fallback to empty list instead of crashing client
        res.json({ success: true, trades: [] });
    }
});
//# sourceMappingURL=trade.routes.js.map