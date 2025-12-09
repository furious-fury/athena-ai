import { Side } from "../generated/prisma/client.js";
import { place_trade } from "../tools/polymarket.js"; // make sure path is correct
import { PortfolioService } from "./PortfolioService.js";
export const TradeService = {
    /**
     * Executes a trade and updates the user's portfolio
     */
    async executeAgentTrade(job) {
        const { userId, agentId, marketId, marketQuestion, outcome, side, amount } = job;
        // Execute trade using your Polymarket tool
        const tradeResult = await place_trade({
            userId,
            agentId,
            marketId,
            outcome,
            amount,
            side,
        });
        // Fetch current market price (or fallback)
        const currentPrice = tradeResult.price ?? tradeResult.settlementPrice ?? 0;
        // Update user portfolio
        const updatedPosition = await PortfolioService.updatePosition(userId, agentId, marketId, side === "BUY" ? Side.BUY : Side.SELL, amount, // THIS is the quantity
        tradeResult.price, // price executed
        currentPrice, // current market price
        outcome, marketQuestion // Pass the title
        );
        return updatedPosition;
    },
};
//# sourceMappingURL=TradeService.js.map