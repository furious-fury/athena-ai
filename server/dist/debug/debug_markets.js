import "dotenv/config";
import fetch from "node-fetch";
const GAMMA_API_URL = "https://gamma-api.polymarket.com";
// Inline get_markets to avoid import headaches
const get_markets = async (limit = 20) => {
    try {
        const response = await fetch(`${GAMMA_API_URL}/markets?active=true&closed=false&limit=${limit}&order=volume24hr&ascending=false`);
        if (!response.ok)
            throw new Error("Failed to fetch markets");
        const data = await response.json();
        // DEBUG: Log first raw item keys
        if (data.length > 0) {
            console.log("\n[RAW MARKET OBJECT KEYS]:", Object.keys(data[0]));
            console.log("Raw ID:", data[0].id);
            console.log("Raw QuestionID:", data[0].questionID);
            console.log("Raw ConditionID:", data[0].conditionId);
        }
        return data.map((m) => ({
            id: m.questionID || m.conditionId,
            question: m.question,
            outcome: "Yes",
            bestBid: m.bestBid,
            bestAsk: m.bestAsk,
            volume24hr: m.volume24hr,
            conditionId: m.conditionId,
            tokenIds: m.clobTokenIds
        }));
    }
    catch (error) {
        console.error("get_markets error:", error);
        return [];
    }
};
async function main() {
    console.log("--- Debugging Market IDs ---");
    // 1. Fetch Markets using current logic
    console.log("Fetching top 3 markets...");
    const markets = await get_markets(3);
    if (markets.length === 0) {
        console.error("No markets found!");
        return;
    }
    const testMarket = markets[0];
    console.log("\n[Sample Market from Tool]");
    console.log("Tool ID (m.id):", testMarket.id);
    console.log("Question:", testMarket.question);
    console.log("Token IDs:", testMarket.tokenIds);
    // 2. Fetch Raw Data for this specific ID to compare
    // The previous error was "id is invalid" on Gamma API lookup.
    // Let's verify if `testMarket.id` works in the Gamma lookup: /markets/{id}
    const lookupId = testMarket.id;
    const gammaUrl = `https://gamma-api.polymarket.com/markets/${lookupId}`;
    console.log(`\n[Testing Gamma Lookup]`);
    console.log(`URL: ${gammaUrl}`);
    try {
        const res = await fetch(gammaUrl);
        if (!res.ok) {
            console.error(`FAILED: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.log("Body:", text);
        }
        else {
            console.log("SUCCESS: Market ID is valid for Lookup.");
            const data = await res.json();
            console.log("Gamma 'id':", data.id);
            console.log("Gamma 'questionID':", data.questionID);
            console.log("Gamma 'conditionId':", data.conditionId);
            console.log("Gamma 'clobTokenIds':", data.clobTokenIds);
            // Log what we NEED for trading (Asset ID)
            if (data.clobTokenIds) {
                console.log("Found clobTokenIds (Asset IDs):", data.clobTokenIds);
            }
        }
    }
    catch (e) {
        console.error("Lookup Exception:", e.message);
    }
}
main();
//# sourceMappingURL=debug_markets.js.map