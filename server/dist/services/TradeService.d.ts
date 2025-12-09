export interface TradeRequest {
    userId: string;
    agentId: string;
    marketId: string;
    marketQuestion?: string;
    outcome: string;
    amount: number;
    side: "BUY" | "SELL";
}
export declare const TradeService: {
    /**
     * Executes a trade and updates the user's portfolio
     */
    executeAgentTrade(job: TradeRequest): Promise<{
        id: string;
        userId: string;
        marketId: string;
        outcome: string;
        marketTitle: string | null;
        shares: number;
        avgEntryPrice: number;
        exposure: number;
    }>;
};
//# sourceMappingURL=TradeService.d.ts.map