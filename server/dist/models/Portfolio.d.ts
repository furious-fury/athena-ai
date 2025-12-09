import { Side } from "../generated/prisma/client.js";
export interface UpdateAfterTradeParams {
    userId: string;
    agentId: string;
    marketId: string;
    amount: number;
    side: "BUY" | "SELL";
    price: number;
    txId: string;
}
export interface AgentJob {
    userId: string;
    agentId: string;
    marketId: string;
    outcome: string;
    amount: number;
    side: "BUY" | "SELL";
}
export declare class PortfolioRedis {
    private static SHARED_QUEUE_KEY;
    private static queueKey;
    /**
     * Cache a user's position in Redis
     */
    static setPosition(userId: string, marketId: string, data: any): Promise<void>;
    /**
     * Retrieve a user's cached position
     */
    static getPosition(userId: string, marketId: string): Promise<any>;
    /**
     * Push a new agent job into Redis queue (SHARED QUEUE)
     */
    static enqueueAgentJob(agentId: string, job: any): Promise<void>;
    /**
     * Pop the next agent job from Redis queue (SHARED QUEUE)
     */
    static dequeueAgentJob(workerId: string): Promise<any>;
    /**
     * Clear queue
     */
    static clearAgentQueue(agentId: string): Promise<void>;
}
export declare class Portfolio {
    static updateAfterTrade(params: UpdateAfterTradeParams & {
        outcome: string;
    }): Promise<{
        id: string;
        userId: string;
        marketId: string;
        outcome: string;
        marketTitle: string | null;
        shares: number;
        avgEntryPrice: number;
        exposure: number;
    }>;
    static getWallet(userId: string): Promise<{
        walletAddress: string;
        scwAddress: string | null;
        scwOwnerPrivateKey: string | null;
        apiKey: string | null;
        apiSecret: string | null;
        apiPassphrase: string | null;
    } | null>;
    static saveTrade(trade: {
        userId: string;
        agentId: string;
        marketId: string;
        outcome: string;
        amount: number;
        side: "BUY" | "SELL";
        txId: string;
        price: number;
    }): Promise<{
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
    static getAllUserPositions(userId: string): Promise<{
        id: string;
        userId: string;
        marketId: string;
        outcome: string;
        marketTitle: string | null;
        shares: number;
        avgEntryPrice: number;
        exposure: number;
    }[]>;
    static getUserExposure(userId: string): Promise<{
        exposure: number;
    }>;
    static updatePositionAfterTrade(userId: string, agentId: string, marketId: string, side: Side, quantity: number, price: number, currentPrice: number, outcome: string, marketTitle?: string): Promise<{
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
//# sourceMappingURL=Portfolio.d.ts.map