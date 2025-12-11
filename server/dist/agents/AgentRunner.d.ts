export interface TradeExecution {
    marketId: string;
    outcome: string;
    amount: number;
    side: "BUY" | "SELL";
}
export interface AgentRunResult {
    success: boolean;
    trade?: any;
    reason?: string;
}
export declare class AgentRunner {
    userId: string;
    agentId: string;
    constructor(userId: string, agentId: string);
    executeTrade(trade: TradeExecution): Promise<AgentRunResult>;
    getPositions(): Promise<any[]>;
}
//# sourceMappingURL=AgentRunner.d.ts.map