import axios from "axios";
import { logger } from "../config/logger.js";
/**
 * The Truth Oracle provides external "truth" to ground agent decisions.
 * It fetches real-world data like crypto prices or news.
 */
export class TruthOracle {
    /**
     * Fetch current price of a crypto asset (e.g. bitcoin, ethereum, polygon)
     * Uses CoinGecko simple API (no key needed for low volume)
     */
    static async fetchCryptoPrice(id = "bitcoin") {
        try {
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`;
            const res = await axios.get(url);
            return res.data[id]?.usd || null;
        }
        catch (err) {
            logger.warn({ err }, `Oracle failed to fetch price for ${id}`);
            return null;
        }
    }
    /**
     * Fetch relevant news/context.
     * For now, this is a mock or could use a free News API if key provided.
     */
    static async fetchMarketNews(topic) {
        // Mocking news for widely spread topics
        if (topic.includes("Trump") || topic.includes("Election")) {
            return "Recent polls show a tightening race. Betting markets favor Trump slightly.";
        }
        if (topic.includes("Crypto") || topic.includes("Bitcoin")) {
            const btcPrice = await this.fetchCryptoPrice("bitcoin");
            return `Bitcoin is trading at $${btcPrice}. Market sentiment is neutral.`;
        }
        return "No specific news found for this topic.";
    }
}
//# sourceMappingURL=truth-oracle.js.map