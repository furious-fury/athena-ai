import type { NewsItem } from "./providers/BaseProvider.js";
import { logger } from "../../config/logger.js";

export class NewsPreprocessor {

    // Simple blocklist for noise
    private static BLOCKLIST_KEYWORDS = [
        "sport", "football", "soccer", "celebrity", "gossip", "movie",
        "dating", "horoscope", "fashion", "recipe", "workout"
    ];

    /**
     * Main pipeline to clean news items
     */
    static async process(items: NewsItem[]): Promise<NewsItem[]> {
        const initialCount = items.length;

        // 1. Deduplication (by Title Similarity or exact ID)
        let cleaned = this.deduplicate(items);

        // 2. Keyword Filtering (Noise Reduction)
        cleaned = this.filterNoise(cleaned);

        // 3. Heuristic Summarization / truncation
        cleaned = cleaned.map(item => this.truncateContent(item));

        logger.info(`🧹 Preprocessor: Reduced ${initialCount} items to ${cleaned.length} high-quality snippets.`);
        return cleaned;
    }

    private static deduplicate(items: NewsItem[]): NewsItem[] {
        const seenTitles = new Set<string>();
        const unique: NewsItem[] = [];

        for (const item of items) {
            // Simple normalization: lowercase and remove non-alphanumeric
            const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");

            if (!seenTitles.has(normalizedTitle)) {
                seenTitles.add(normalizedTitle);
                unique.push(item);
            }
        }
        return unique;
    }

    private static filterNoise(items: NewsItem[]): NewsItem[] {
        return items.filter(item => {
            const text = (item.title + " " + item.content).toLowerCase();
            const isSpam = this.BLOCKLIST_KEYWORDS.some(keyword => text.includes(keyword));
            return !isSpam;
        });
    }

    private static truncateContent(item: NewsItem): NewsItem {
        // Limit content to 500 chars to save tokens
        // logic: keep first 500 chars, or first paragraph
        const maxLength = 500;
        let newContent = item.content;

        if (newContent.length > maxLength) {
            newContent = newContent.substring(0, maxLength) + "... [truncated]";
        }

        return {
            ...item,
            content: newContent
        };
    }
}
