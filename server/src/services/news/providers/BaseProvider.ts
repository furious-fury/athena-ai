export interface NewsItem {
    id: string;
    source: string;
    title: string;
    content: string; // Summary or full text
    url?: string;
    publishedAt: Date;
    topics?: string[]; // e.g. ["Crypto", "Politics"]
    tickers?: string[]; // e.g. ["BTC", "ETH"]
}

export abstract class BaseNewsProvider {
    abstract name: string;

    /**
     * Fetch latest news from this provider
     * @param limit Number of items to fetch
     */
    abstract fetchNews(limit?: number): Promise<NewsItem[]>;
}
