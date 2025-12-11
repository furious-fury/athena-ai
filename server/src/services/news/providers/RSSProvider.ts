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
        { sourceName: "BBC World", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
        { sourceName: "AP Top News", url: "https://feeds.npr.org/1001/rss.xml" }, // Using NPR as reliable proxy for top news
        // Add AP or other feeds here
    ];

    constructor() {
        super();
        this.parser = new Parser();
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
