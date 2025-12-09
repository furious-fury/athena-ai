import { prisma } from "../config/database.js";
import { Side } from "../generated/prisma/client.js";
export class Portfolio {
    // Fetch wallet, trades, positions... existing methods
    /**
     * Updates position for a user after a trade
     * @param userId string
     * @param marketId string
     * @param tradeSide Side.BUY | Side.SELL
     * @param amount number - amount of contracts
     * @param price number - price per contract
     * @param currentMarketPrice number - current price for pnl calculation
     */
    static async updatePositionAfterTrade(userId, agentId, marketId, tradeSide, amount, price, currentMarketPrice) {
        // Fetch existing position
        let position = await prisma.position.findUnique({
            where: { userId_marketId: { userId, marketId } },
        });
        if (!position) {
            // Create if it doesn't exist
            position = await prisma.position.create({
                data: {
                    userId,
                    marketId,
                    exposure: amount,
                    shares: tradeSide === Side.BUY ? amount : -amount,
                    avgEntryPrice: price,
                    outcome: "YES", // Default required field, logic might need adjustment if outcome varies
                },
            });
            return position;
        }
        // Calculate new quantity
        let newQuantity = tradeSide === Side.BUY
            ? position.shares + amount
            : position.shares - amount;
        // Calculate new average price (weighted)
        let newAvgPrice = tradeSide === Side.BUY
            ? ((position.avgEntryPrice ?? 0) * position.shares + price * amount) / newQuantity
            : position.avgEntryPrice ?? 0; // For SELL, avgPrice remains the same
        // Update exposure
        let newExposure = position.exposure + amount;
        // PnL removed from schema, handled externally or calculated on fly
        // let newPnL = (currentMarketPrice - newAvgPrice) * newQuantity;
        // Update position in DB
        position = await prisma.position.update({
            where: { userId_marketId: { userId, marketId } },
            data: {
                shares: newQuantity,
                avgEntryPrice: newAvgPrice,
                exposure: newExposure,
            },
        });
        return position;
    }
}
//# sourceMappingURL=portfolio.js.map