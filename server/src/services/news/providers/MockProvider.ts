import { BaseNewsProvider, type NewsItem } from "./BaseProvider.js";

export class MockProvider extends BaseNewsProvider {
    name = "MockProvider";

    async fetchNews(limit: number = 5): Promise<NewsItem[]> {
        return [
            {
                id: "mock-1",
                source: "MockSource",
                title: "Fed Expected to Cut Rates by 25bps",
                content: "Federal Reserve officials have hinted at a rate cut in the upcoming meeting due to cooling inflation...",
                publishedAt: new Date(),
                topics: ["Economy", "Fed"],
                tickers: ["USD"]
            },
            {
                id: "mock-2",
                source: "MockSource",
                title: "Bitcoin Surges Past $100k on ETF Inflows",
                content: "Institutional demand continues to drive BTC price upwards as ETFs record record volume...",
                publishedAt: new Date(),
                topics: ["Crypto", "Bitcoin"],
                tickers: ["BTC"]
            },
            {
                id: "mock-3",
                source: "MockSource",
                title: "New AI Regulation Bills Proposed in EU",
                content: "The European Union is debating stricer controls on generative AI models...",
                publishedAt: new Date(),
                topics: ["AI", "Regulation", "Politics"],
                tickers: []
            }
        ];
    }
}
