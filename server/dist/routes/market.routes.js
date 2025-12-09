import { Router } from "express";
export const marketRouter = Router();
import { get_markets, get_active_events } from "../tools/polymarket.js";
marketRouter.get("/", async (_req, res) => {
    try {
        const limit = Number(_req.query.limit) || 50;
        // Fetch events instead of markets to get Tags/Categories
        const events = await get_active_events(limit);
        const markets = [];
        events.forEach((event) => {
            const category = event.tags?.[0]?.label || "Uncategorized";
            if (event.markets) {
                event.markets.forEach((m) => {
                    markets.push({
                        id: m.id,
                        question: m.question,
                        outcome: "Yes",
                        probability: m.lastTradePrice || m.bestBid || 0,
                        volume: m.volume24hr || 0,
                        liquidity: m.liquidity || 0,
                        image: m.image || event.image || "https://polymarket.com/images/fallback.png",
                        endDate: m.endDate || m.closeTime,
                        category: category
                    });
                });
            }
        });
        res.json(markets);
    }
    catch (error) {
        console.error("Failed to fetch markets:", error);
        res.status(500).json({ error: "Failed to fetch markets" });
    }
});
//# sourceMappingURL=market.routes.js.map