import type { NewsItem } from "../news/providers/BaseProvider.js";
import { LLMRouter } from "../../llm/llm-router.js";
import { logger } from "../../config/logger.js";

export interface MarketSignal {
    headline: string;
    confidence: number; // 0-100
    marketTopic: string; // "Bitcoin", "Election", "Fed"
    direction: "BULLISH" | "BEARISH" | "NEUTRAL";
    reasoning: string;
    relevantTickers: string[];
}

export class MarketIntelligence {

    /**
     * Analyze a batch of news items and extract high-confidence signals
     */
    static async analyze(newsItems: NewsItem[]): Promise<MarketSignal[]> {
        if (newsItems.length === 0) return [];

        logger.info(`🧠 MarketIntelligence analyzing ${newsItems.length} news items...`);

        // Format news for LLM
        const newsContext = newsItems.map((item, i) => `
        [${i + 1}] SOURCE: ${item.source} (${item.publishedAt.toISOString()})
        TITLE: ${item.title}
        CONTENT: ${item.content}
        ------------------------------------------------
        `).join("\n");

        const prompt = `
        You are a top-tier Financial Analyst AI.
        
        INPUT DATA:
        ${newsContext}

        TASK:
        Identify any SIGNIFICANT market-moving events from the news above.
        Ignore noise, focus on hard data (rate cuts, election results, regulatory approvals, hacks, earnings).
        
        OUTPUT format (JSON Array):
        [
            {
                "headline": "Short summary of the event",
                "marketTopic": "Main topic (e.g. Bitcoin, Fed, US Election)",
                "direction": "BULLISH" | "BEARISH" | "NEUTRAL",
                "confidence": number (0-100, be conservative),
                "reasoning": "Why this moves the market",
                "relevantTickers": ["BTC", "ETH", etc]
            }
        ]

        Return ONLY standard JSON. If no significant events, return [].
        `;

        try {
            // Use Gemini/OpenAI based on available keys
            // Priority: OpenAI (User Pref) -> Gemini (Free Tier)
            let providerName = "GEMINI"; // Default

            if (process.env.OPENAI_API_KEY) {
                providerName = "OPENAI";
                logger.info("🧠 MarketIntelligence using OPENAI (Key found)");
            } else if (process.env.GOOGLE_API_KEY) {
                providerName = "GEMINI";
            } else {
                logger.warn("⚠️ No API Keys found for MarketIntelligence. Defaulting to GEMINI (will fail if no key).");
            }

            const provider = LLMRouter.getProvider(providerName);

            const response = await provider.generateResponse(prompt, "Extract signals.");

            if (!response) return [];

            const jsonStr = response.replace(/```json/g, "").replace(/```/g, "").trim();
            let signals: MarketSignal[] = [];
            try {
                const parsed = JSON.parse(jsonStr);
                if (Array.isArray(parsed)) {
                    signals = parsed;
                } else if (parsed.signals && Array.isArray(parsed.signals)) {
                    signals = parsed.signals;
                } else if (parsed.result && Array.isArray(parsed.result)) {
                    signals = parsed.result;
                } else {
                    logger.warn({ parsed }, "LLM response was valid JSON but not an array/wrapped array");
                }
            } catch (e) {
                logger.error({ jsonStr }, "Failed to parse LLM JSON response");
            }

            // Filter for high confidence only - LOWERED to 40 to let Degen agents decide
            const highConfidenceSignals = signals.filter(s => s.confidence > 40);

            logger.info(`🧠 Intelligence found ${highConfidenceSignals.length} high-confidence signals.`);
            return highConfidenceSignals;

        } catch (err) {
            logger.error({ err }, "MarketIntelligence Analysis Failed");
            return [];
        }
    }
}
