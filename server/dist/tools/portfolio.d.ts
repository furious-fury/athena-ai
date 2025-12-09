import { Side } from "../generated/prisma/client.js";
export declare class Portfolio {
    /**
     * Updates position for a user after a trade
     * @param userId string
     * @param marketId string
     * @param tradeSide Side.BUY | Side.SELL
     * @param amount number - amount of contracts
     * @param price number - price per contract
     * @param currentMarketPrice number - current price for pnl calculation
     */
    static updatePositionAfterTrade(userId: string, agentId: string, marketId: string, tradeSide: Side, amount: number, price: number, currentMarketPrice: number): Promise<{
        id: string;
        userId: string;
        marketId: string;
        outcome: string;
        marketTitle: string | null;
        shares: number;
        avgEntryPrice: number;
        exposure: number;
    }>;
}
//# sourceMappingURL=portfolio.d.ts.map