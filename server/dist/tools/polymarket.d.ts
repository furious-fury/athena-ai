export interface TradeParams {
    userId: string;
    agentId?: string;
    marketId: string;
    outcome: string;
    side: string;
    amount: number;
    price?: number;
}
export interface Market {
    id: string;
    question: string;
    outcome: string;
    bestBid: number;
    bestAsk: number;
    volume24hr: number;
    questionId: string;
    conditionId: string;
    tokenIds?: string[];
}
/**
 * Fetches top active markets from Gamma API
 */
export declare const get_markets: (limit?: number) => Promise<Market[]>;
/**
 * Fetches active events (with markets nested)
 */
export declare const get_active_events: (limit?: number) => Promise<any>;
/**
 * Fetches user positions from Gamma API (Real-time)
 */
export declare const get_positions: (userId: string) => Promise<any[]>;
/**
 * Gets the USER's real wallet balance (EOA or Proxy) for display.
 */
export declare const get_balance: (userId: string) => Promise<{
    usdc: string;
    pol: string;
    address: string;
}>;
export declare const place_trade: (trade: TradeParams) => Promise<{
    status: string;
    txId: any;
    price: number;
    settlementPrice: number;
}>;
/**
 * Fetches trade history from Polymarket Data API (Gamma)
 * Uses public API which is more reliable for historical display than CLOB
 */
export declare const get_trades: (userId: string) => Promise<{
    id: any;
    market: any;
    asset_id: any;
    side: any;
    size: any;
    price: any;
    timestamp: any;
    outcome: any;
    transactionHash: any;
    icon: any;
}[]>;
/**
 * Closes a position by placing a SELL order for the full size.
 * Bypasses place_trade "USDC amount" logic to ensure exact share selling.
 */
export declare const close_position: (userId: string, marketId: string, outcome: string) => Promise<{
    success: boolean;
    txId: any;
}>;
//# sourceMappingURL=polymarket.d.ts.map