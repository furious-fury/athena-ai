import { Side } from "../generated/prisma/client.js";
export interface TradeRecord {
    userId: string;
    agentId: string;
    marketId: string;
    outcome: string;
    amount: number;
    side: "BUY" | "SELL";
    txId: string;
    price: number;
}
export declare class PortfolioService {
    /**
     * Update a user's position after a trade.
     * Returns the updated position including PnL calculation.
     */
    static updatePosition(userId: string, agentId: string, marketId: string, side: Side, quantity: number, price: number, currentPrice: number, outcome: string, marketTitle?: string): Promise<{
        id: string;
        userId: string;
        marketId: string;
        outcome: string;
        marketTitle: string | null;
        shares: number;
        avgEntryPrice: number;
        exposure: number;
    }>;
    /**
     * Save executed trade details for history/logging
     */
    static saveTrade(trade: TradeRecord): Promise<{
        id: string;
        userId: string;
        agentId: string;
        marketId: string;
        amount: number;
        side: string;
        price: number | null;
        txId: string | null;
        outcome: string;
        status: import("@prisma/client").$Enums.TradeStatus;
        createdAt: Date;
    }>;
    /**
     * Fetch current positions for a user or agent from Polymarket API
     */
    static getAllUserPositions(userId: string): Promise<{
        id: any;
        userId: string;
        marketId: any;
        marketTitle: any;
        outcome: any;
        shares: number;
        avgEntryPrice: number;
        exposure: number;
    }[]>;
    /**
     * Fetch user balance (USDC & POL)
     */
    static getUserBalance(userId: string): Promise<{
        usdc: string;
        pol: string;
        address: string;
    }>;
    /**
     * Fetch PnL for a specific market or overall
     */
    static getPnL(userId: string, marketId?: string): Promise<number>;
}
//# sourceMappingURL=PortfolioService.d.ts.map