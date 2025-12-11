import axios from "axios";
import { BaseNewsProvider, type NewsItem } from "./BaseProvider.js";
// import { logger } from "../../../config/logger.js"; 

export class CoinGeckoProvider extends BaseNewsProvider {
    name = "CoinGeckoProvider";

    async fetchNews(limit: number = 10): Promise<NewsItem[]> {
        try {
            const res = await axios.get("https://api.coingecko.com/api/v3/search/trending");
            const coins = res.data.coins || [];

            return coins.map((c: any) => ({
                id: `cg-${c.item.id}`,
                source: "CoinGecko Trending",
                title: `${c.item.name} (${c.item.symbol}) is trending #${c.item.market_cap_rank}`,
                content: `Price: ${c.item.data.price}. Market Cap Rank: ${c.item.market_cap_rank}. Score: ${c.item.score}`,
                publishedAt: new Date(), // Real-time
                url: `https://www.coingecko.com/en/coins/${c.item.id}`,
                topics: ["Crypto", "Trending"],
                tickers: [c.item.symbol.toUpperCase()]
            })).slice(0, limit);

        } catch (err) {
            // logger.warn({ err }, "Failed to fetch CoinGecko trending");
            return [];
        }
    }
}
