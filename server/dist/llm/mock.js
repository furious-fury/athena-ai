import { logger } from "../config/logger.js";
export class MockProvider {
    constructor() { }
    async generateResponse(systemPrompt, userPrompt) {
        logger.info("🤖 [MOCK LLM] Generating simulated response...");
        // Randomly decide to TRADE or HOLD
        const actions = ["TRADE", "HOLD", "HOLD", "TRADE"];
        const action = actions[Math.floor(Math.random() * actions.length)];
        let decision;
        if (action === "TRADE") {
            const sides = ["BUY", "SELL"];
            const outcomes = ["YES", "NO"];
            decision = {
                action: "TRADE",
                marketId: "0xMockMarketId", // logic in AgentLoop overrides this anyway usually
                side: sides[Math.floor(Math.random() * sides.length)],
                outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
                amount: Math.floor(Math.random() * 50) + 10,
                reason: "Mock LLM sees a great opportunity based on simulation."
            };
        }
        else {
            decision = {
                action: "HOLD",
                reason: "Mock LLM decides to wait for better conditions."
            };
        }
        return JSON.stringify(decision);
    }
}
//# sourceMappingURL=mock.js.map