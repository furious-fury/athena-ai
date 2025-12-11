import { NewsService } from "../services/news/NewsService.js";
import { NewsPreprocessor } from "../services/news/NewsPreprocessor.js";
import { MarketIntelligence } from "../services/analysis/MarketIntelligence.js";
import { SignalProcessor } from "../services/analysis/SignalProcessor.js";
import { logger } from "../config/logger.js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables manually since we are running a script
// Load environment variables manually since we are running a script
const envPath = path.resolve(process.cwd(), ".env");
const envResult = dotenv.config({ path: envPath });

console.log(`📂 Loading .env from: ${envPath}`);
if (envResult.error) {
    console.error("⚠️ Failed to load .env:", envResult.error);
} else {
    // console.log("✅ Loaded .env keys:", Object.keys(envResult.parsed || {})); 
    // Don't log keys for security, but check counts
    console.log(`✅ Loaded ${Object.keys(envResult.parsed || {}).length} environment variables.`);
}

// Debug API Keys (masked)
const hasOpenAI = !!process.env.OPENAI_API_KEY;
const hasGemini = !!process.env.GOOGLE_API_KEY;
console.log(`🔑 API Keys Status: OpenAI=${hasOpenAI}, Gemini=${hasGemini}\n`);

if (!hasOpenAI && !hasGemini) {
    console.warn("⚠️ NO LLM API KEYS FOUND. Analysis will fail.");
}

async function runTest() {
    console.log("🚀 Starting News Pipeline Test...\n");

    // 1. Fetch News
    console.log("📰 Fetching News...");
    const newsService = new NewsService();
    // Force wait for initialization if async, but constructor is synchronous registration
    const rawNews = await newsService.fetchAllNews();
    console.log(`✅ Fetched ${rawNews.length} raw news items.`);

    if (rawNews.length > 0) {
        console.log(`   Sample: "${rawNews[0]?.title}" (${rawNews[0]?.source})`);
    }

    // 2. Preprocess
    console.log("\n🧹 Preprocessing...");
    const cleanNews = await NewsPreprocessor.process(rawNews);
    console.log(`✅ Reduced to ${cleanNews.length} clean items.`);

    if (cleanNews.length === 0) {
        console.log("❌ No news to analyze. Exiting.");
        return;
    }

    // 3. Analyze
    console.log("\n🧠 Analyzing with LLM (This may take a moment)...");

    // LIMIT to 5 items to save tokens.
    // Note: Without MockProvider, we might not get a signal every time.
    const limitedNews = cleanNews.slice(0, 5);

    const signals = await MarketIntelligence.analyze(limitedNews);
    console.log(`✅ Generated ${signals.length} market signals.`);

    if (signals.length > 0) {
        signals.forEach((s, i) => {
            console.log(`   [Signal ${i + 1}] ${s.headline} (Confidence: ${s.confidence}%) -> ${s.direction}`);
        });
    } else {
        console.log("❌ No signals found.");
        return;
    }

    // 4. Find Markets
    console.log("\n🔍 searching Polymarket...");
    const opportunities = await SignalProcessor.processSignals(signals);
    console.log(`✅ Found ${opportunities.length} trade opportunities.`);

    if (opportunities.length > 0) {
        opportunities.forEach((op, i) => {
            console.log(`\n   [Opportunity ${i + 1}]`);
            console.log(`   Signal: ${op.signal.headline}`);
            console.log(`   Market: "${op.market.question}" (ID: ${op.market.id})`);
            console.log(`   Volume: $${op.market.volume24hr}`);
            console.log(`   Prices: Yes ${op.market.bestBid} | No ${op.market.bestAsk}`);
        });
    }

    console.log("\n✅ Test Complete.");
    process.exit(0);
}

runTest().catch(e => {
    console.error("❌ Test Failed:", e);
    process.exit(1);
});
