import { PortfolioRedis, Portfolio } from "../models/Portfolio.js";
import { LLMRouter } from "../llm/llm-router.js";
import { logger } from "../config/logger.js";
import { get_markets } from "../tools/polymarket.js";
import { TruthOracle } from "../tools/truth-oracle.js";
import { prisma } from "../config/database.js";
import { AgentLog } from "../models/AgentLog.js";
export class AgentLoop {
    constructor(userId, agentId) {
        this.running = false;
        this.interval = null;
        this.userId = userId;
        this.agentId = agentId;
    }
    start(intervalMs = 60000) {
        if (this.running)
            return;
        this.running = true;
        // Run immediately first, then interval
        this.tick();
        this.interval = setInterval(() => this.tick(), intervalMs);
        logger.info(`🧠 AgentLoop started for ${this.agentId} (User: ${this.userId})`);
    }
    stop() {
        this.running = false;
        if (this.interval)
            clearInterval(this.interval);
        logger.info(`🧠 AgentLoop stopped for ${this.agentId}`);
    }
    async tick() {
        try {
            // 1. Load Agent from DB (Fresh state every tick)
            const agent = await prisma.agent.findUnique({ where: { id: this.agentId } });
            if (!agent) {
                logger.warn(`Agent ${this.agentId} not found in DB. Stopping loop.`);
                this.stop();
                return;
            }
            if (!agent.isActive) {
                logger.info(`Agent ${this.agentId} is paused. Skipping tick.`);
                return;
            }
            logger.info(`🤔 Agent ${agent.name} (${agent.riskProfile}) thinking...`);
            // 2. Gather Context
            const markets = await get_markets(20); // Fetch top 20 active markets
            if (!markets || markets.length === 0) {
                logger.warn("No active markets found.");
                return;
            }
            // Log Analysis Start
            await AgentLog.create({
                agentId: this.agentId,
                userId: this.userId,
                type: "ANALYSIS",
                message: `Scanning top 20 active markets...`,
                metadata: { marketIds: markets.map(m => m.id) }
            });
            // Get User Stats & Limits
            const exposure = await Portfolio.getUserExposure(this.userId);
            const user = await prisma.user.findUnique({
                where: { id: this.userId },
                select: {
                    maxTradeAmount: true,
                    maxTotalExposure: true,
                    balance: true
                }
            });
            const maxTrade = user?.maxTradeAmount || 10; // Default small
            const maxBudget = user?.maxTotalExposure || 100; // Default small
            const currentExposure = exposure.exposure * (user?.balance || 0);
            const remainingBudget = Math.max(0, maxBudget - currentExposure);
            // 2.5 Fetch Open Positions to Prevent Double Buying
            const existingPositions = await prisma.position.findMany({
                where: {
                    userId: this.userId,
                    shares: { gt: 0 } // Only positive shares
                },
                select: { marketId: true }
            });
            const heldMarketIds = new Set(existingPositions.map(p => p.marketId));
            // Filter out markets we already hold
            const availableMarkets = markets.filter(m => !heldMarketIds.has(m.id));
            if (availableMarkets.length === 0) {
                logger.info("All top markets already have open positions. Skipping tick.");
                return;
            }
            // 3. Build Market Options List
            const marketsList = availableMarkets.map((m, idx) => `
Market ${idx + 1}:
  - ID: ${m.id}
  - Question: "${m.question}"
  - Current Prices: YES=${m.bestBid || 0.5} | NO=${1 - (m.bestBid || 0.5)}
  - 24h Volume: $${m.volume24hr || 0}
            `).join('\n');
            // 4. Build System Prompt
            const provider = LLMRouter.getProvider(agent.llmProvider, agent.llmModel || undefined);
            const dynamicContext = `
AVAILABLE MARKETS:
${marketsList}

YOUR PORTFOLIO:
- Current Exposure: $${currentExposure.toFixed(2)}
- Remaining Budget: $${remainingBudget.toFixed(2)} (Max Total: $${maxBudget})
- Max Trade Size: $${maxTrade}
- Balance: $${user?.balance || 0}
            `;
            const fullSystemPrompt = `${agent.systemPrompt}
            
${dynamicContext}
            
INSTRUCTIONS:
You are analyzing ${availableMarkets.length} markets. Choose the BEST opportunity based on your risk profile.
You MUST respect your Remaining Budget and Max Trade Size.
Decide whether to TRADE or HOLD.
If TRADE, specify which market by its ID.
Output JSON only: { "action": "TRADE" | "HOLD", "marketId": "market_id_here", "side": "BUY" | "SELL", "amount": number, "outcome": "YES" | "NO", "reason": "short explanation" }
            `;
            const userPrompt = `Analyze these ${availableMarkets.length} markets. What is your move?`;
            // 4. Call LLM
            const response = await provider.generateResponse(fullSystemPrompt, userPrompt);
            if (!response) {
                logger.warn("LLM returned no response.");
                return;
            }
            let decision;
            try {
                // Sanitize JSON if LLM adds markdown backticks
                const jsonStr = response.replace(/```json/g, "").replace(/```/g, "").trim();
                decision = JSON.parse(jsonStr);
            }
            catch (e) {
                logger.error({ response }, "Failed to parse LLM JSON");
                return;
            }
            // Log Decision
            const targetMarket = markets.find(m => m.id === decision.marketId);
            const marketQuestion = targetMarket ? `"${targetMarket.question}"` : decision.marketId;
            const amountStr = decision.amount ? `$${decision.amount}` : "default amount";
            await AgentLog.create({
                agentId: this.agentId,
                userId: this.userId,
                type: "DECISION",
                message: decision.action === "TRADE"
                    ? `Decided to ${decision.side} ${decision.outcome} (${amountStr}) on ${marketQuestion}`
                    : `Holding: ${decision.reason}`,
                metadata: { decision, marketQuestion }
            });
            // 5. Act
            if (decision.action === "TRADE" && decision.marketId) {
                logger.info(`💡 ${agent.name} decides to TRADE: ${decision.side} ${decision.outcome} (${amountStr}) on ${marketQuestion}`);
                const tradeAmount = decision.amount || 10;
                // ** RISK CHECK **
                const { RiskManager } = await import("../services/RiskManager.js");
                const riskCheck = await RiskManager.validateTrade({
                    userId: this.userId,
                    marketId: decision.marketId,
                    amount: tradeAmount,
                });
                if (!riskCheck.allowed) {
                    logger.warn(`🚫 Trade blocked by risk manager: ${riskCheck.reason}`);
                    await AgentLog.create({
                        agentId: this.agentId,
                        userId: this.userId,
                        type: "RISK_BLOCK",
                        message: `Trade blocked: ${riskCheck.reason}`,
                        metadata: { trade: decision, riskCheck }
                    });
                    return;
                }
                // Enqueue the job for execution
                await PortfolioRedis.enqueueAgentJob(this.agentId, {
                    userId: this.userId,
                    agentId: this.agentId,
                    marketId: decision.marketId,
                    marketQuestion: targetMarket?.question || decision.marketId, // Pass question
                    outcome: decision.outcome || "YES",
                    amount: tradeAmount,
                    side: decision.side || "BUY",
                });
                logger.info(`📤 Job enqueued for agent ${this.agentId} - ${decision.side} ${tradeAmount} on ${decision.marketId}`);
            }
            else {
                logger.info(`💤 ${agent.name} decides to HOLD. Reason: ${decision.reason}`);
            }
        }
        catch (err) {
            logger.error({ err }, `❌ Error in AgentLoop for ${this.agentId}`);
        }
    }
}
//# sourceMappingURL=AgentLoop.js.map