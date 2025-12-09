/**
 * The Truth Oracle provides external "truth" to ground agent decisions.
 * It fetches real-world data like crypto prices or news.
 */
export declare class TruthOracle {
    /**
     * Fetch current price of a crypto asset (e.g. bitcoin, ethereum, polygon)
     * Uses CoinGecko simple API (no key needed for low volume)
     */
    static fetchCryptoPrice(id?: string): Promise<number | null>;
    /**
     * Fetch relevant news/context.
     * For now, this is a mock or could use a free News API if key provided.
     */
    static fetchMarketNews(topic: string): Promise<string>;
}
//# sourceMappingURL=truth-oracle.d.ts.map