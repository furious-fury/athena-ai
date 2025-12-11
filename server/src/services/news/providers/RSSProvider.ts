import Parser from "rss-parser";
import { BaseNewsProvider, type NewsItem } from "./BaseProvider.js";
import { logger } from "../../../config/logger.js";

interface FeedConfig {
    sourceName: string;
    url: string;
}

export class RSSProvider extends BaseNewsProvider {
    name = "RSSProvider";
    private parser: Parser;
    private feeds: FeedConfig[] = [
        // --- CRYPTO (Primary Alpha) ---
        { sourceName: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
        { sourceName: "CoinTelegraph", url: "https://cointelegraph.com/rss" },
        { sourceName: "Decrypt", url: "https://decrypt.co/feed" },
        { sourceName: "The Block", url: "https://www.theblock.co/rss.xml" },
        { sourceName: "Bitcoin Magazine", url: "https://bitcoinmagazine.com/.rss/full/" },

        // --- TECH (Innovation & AI News) ---
        { sourceName: "TechCrunch", url: "https://techcrunch.com/feed/" },
        { sourceName: "Wired", url: "https://www.wired.com/feed/rss" },
        { sourceName: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
        { sourceName: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },

        // --- WORLD & FINANCE (Macro Context) ---
        // Reuters feeds often change/break, using Google News topics as reliable proxies or specific reliable RSS mirrors if available.
        // For now, removing broken Reuters direct links and using reliable alternatives.
        { sourceName: "CNBC International", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100004038" },
        { sourceName: "BBC World", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
        { sourceName: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },

        // --- US & EU POLITICS ---
        { sourceName: "Politico", url: "https://www.politico.com/rss/politicopicks.xml" }, // Updated to working feed
        { sourceName: "Politico EU", url: "https://www.politico.eu/feed/" },
        { sourceName: "NYT Politics", url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml" },
    ];

    constructor() {
        super();
        this.parser = new Parser({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
    }

    async fetchNews(limit: number = 20): Promise<NewsItem[]> {
        const allItems: NewsItem[] = [];

        for (const feed of this.feeds) {
            try {
                const parsed = await this.parser.parseURL(feed.url);

                parsed.items.forEach(item => {
                    if (item.title && item.link) {
                        allItems.push({
                            id: item.guid || item.link,
                            source: feed.sourceName,
                            title: item.title,
                            content: item.contentSnippet || item.content || "",
                            url: item.link,
                            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                            topics: ["World News"], // Simplified for now
                            tickers: []
                        });
                    }
                });
            } catch (err) {
                logger.warn({ err, feed: feed.sourceName }, "Failed to fetch RSS feed");
            }
        }

        return allItems.slice(0, limit);
    }
}
