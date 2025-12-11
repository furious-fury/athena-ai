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
        const { get_trades } = await import("../tools/polymarket.js");
        const trades = await get_trades(userId);
        res.json({ success: true, trades });
    }
    catch (err) {
        console.error("Trade history error:", err);
        res.status(500).json({ success: false, error: "Failed to fetch trade history" });
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
    }
    catch (err) {
        console.error("Close trade error:", err);
        res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Failed to close position" });
    }
});
//# sourceMappingURL=trade.routes.js.map