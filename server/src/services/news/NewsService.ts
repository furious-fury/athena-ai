import { BaseNewsProvider, type NewsItem } from "./providers/BaseProvider.js";
import { MockProvider } from "./providers/MockProvider.js";
import { RSSProvider } from "./providers/RSSProvider.js";
import { CoinGeckoProvider } from "./providers/CoinGeckoProvider.js";
import { TwitterProvider, RedditProvider, GoogleTrendsProvider, SECFilingProvider, GovDataProvider } from "./providers/Placeholders.js";
import { logger } from "../../config/logger.js";

export class NewsService {
    private providers: BaseNewsProvider[] = [];

    constructor() {
        // Initialize default providers
        // this.registerProvider(new MockProvider()); // Disabled for production
        this.registerProvider(new RSSProvider());
        this.registerProvider(new CoinGeckoProvider());

        // Register placeholders
        this.registerProvider(new TwitterProvider());
        this.registerProvider(new RedditProvider());
        this.registerProvider(new GoogleTrendsProvider());
        this.registerProvider(new SECFilingProvider());
        this.registerProvider(new GovDataProvider());
    }

    registerProvider(provider: BaseNewsProvider) {
        this.providers.push(provider);
        logger.info(`📰 Registered news provider: ${provider.name}`);
    }

    /**
     * Fetch and aggregate news from all active providers
     */
    async fetchAllNews(): Promise<NewsItem[]> {
        logger.info("📰 Fetching news from all providers...");

        const promises = this.providers.map(p =>
            p.fetchNews().catch(err => {
                logger.error({ err, provider: p.name }, "Failed to fetch news");
                return [];
            })
        );

        const results = await Promise.all(promises);

        // Flatten results
        const allNews = results.flat();

        // Sort by date (newest first)
        return allNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    }
}

// Singleton export
export const newsService = new NewsService();
