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
        You are a top-tier Financial Analyst AI specializing in prediction markets and speculative trading.
        
        INPUT DATA:
        ${newsContext}

        TASK:
        Identify ANY potentially tradeable events from the news above. Be AGGRESSIVE and SPECULATIVE.
        
        Look for:
        - Hard catalysts: rate cuts, election results, regulatory approvals, hacks, earnings
        - Soft signals: trending coins, new tech launches, political developments, market sentiment shifts
        - Crypto-specific: exchange listings, protocol upgrades, whale movements, adoption news
        - Tech trends: AI breakthroughs, product launches, funding rounds
        
        For prediction markets, even MODERATE news can create trading opportunities if it relates to:
        - Cryptocurrency prices or adoption
        - Political events or elections  
        - Tech company performance
        - Economic indicators
        
        OUTPUT format (JSON Array):
        [
            {
                "headline": "Short summary of the event",
                "marketTopic": "Main topic (e.g. Bitcoin, Fed, US Election, AI)",
                "direction": "BULLISH" | "BEARISH" | "NEUTRAL",
                "confidence": number (0-100, be LIBERAL with 20-50% range for speculative plays),
                "reasoning": "Why this could move prediction markets",
                "relevantTickers": ["BTC", "ETH", etc]
            }
        ]

        Return ONLY standard JSON. If truly nothing is relevant, return [].
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

            // Log ALL signals for debugging (even low confidence)
            if (signals.length > 0) {
                logger.info(`🧠 AI Analysis Results: Found ${signals.length} total signals`);
                signals.forEach((s, idx) => {
                    logger.info(`   [${idx + 1}] ${s.confidence}% confidence - ${s.direction} on ${s.marketTopic}`);
                    logger.info(`       Headline: ${s.headline}`);
                    logger.info(`       Reasoning: ${s.reasoning}`);
                });
            } else {
                logger.info(`🧠 AI Analysis: No signals detected in this batch.`);
            }

            // Filter for signals above threshold - LOWERED to 20% for HIGH risk agents
            const highConfidenceSignals = signals.filter(s => s.confidence > 20);

            logger.info(`🧠 Intelligence found ${highConfidenceSignals.length} signals above 20% confidence threshold.`);
            return highConfidenceSignals;

        } catch (err) {
            logger.error({ err }, "MarketIntelligence Analysis Failed");
            return [];
        }
    }
}
