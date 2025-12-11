import { PortfolioRedis, Portfolio } from "../models/Portfolio.js";
import { LLMRouter } from "../llm/llm-router.js";
import { logger } from "../config/logger.js";
import { get_markets } from "../tools/polymarket.js";
import { TruthOracle } from "../tools/truth-oracle.js";
import { prisma } from "../config/database.js";
import { AgentLog } from "../models/AgentLog.js";

interface AgentDecision {
    action: "TRADE" | "HOLD";
    marketId?: string;
    side?: "BUY" | "SELL";
    amount?: number;
    outcome?: "YES" | "NO";
    reason?: string;
}

export class AgentLoop {
    private agentId: string;
    private userId: string;
    private running: boolean = false;
    private interval: NodeJS.Timeout | null = null;

    constructor(userId: string, agentId: string) {
        this.userId = userId;
        this.agentId = agentId;
    }

    start(intervalMs: number = 60000) {
        if (this.running) return;
        this.running = true;

        // Run immediately first, then interval
        this.tick();

        this.interval = setInterval(() => this.tick(), intervalMs);
        logger.info(`🧠 AgentLoop started for ${this.agentId} (User: ${this.userId})`);
    }

    stop() {
        this.running = false;
        if (this.interval) clearInterval(this.interval);
        logger.info(`🧠 AgentLoop stopped for ${this.agentId}`);
    }

    private async tick() {
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

            logger.info(`🤔 Agent ${agent.name} (${agent.riskProfile}) starting news scan...`);

            // -----------------------------------------------------------------
            // NEW: News-Driven Logic
            // -----------------------------------------------------------------

            // 2. Fetch & Preprocess News
            const { newsService } = await import("../services/news/NewsService.js");
            const { NewsPreprocessor } = await import("../services/news/NewsPreprocessor.js");

            const rawNews = await newsService.fetchAllNews();
            const cleanNews = await NewsPreprocessor.process(rawNews);

            if (cleanNews.length === 0) {
                logger.info("No relevant news found this tick.");
                return;
            }

            // 3. Analyze News for Signals
            const { MarketIntelligence } = await import("../services/analysis/MarketIntelligence.js");
            const signals = await MarketIntelligence.analyze(cleanNews);

            if (signals.length === 0) {
                logger.info("News analyzed, but no high-confidence signals found.");
                return;
            }

            // 4. Find Market Opportunities from Signals
            const { SignalProcessor } = await import("../services/analysis/SignalProcessor.js");
            const opportunities = await SignalProcessor.processSignals(signals);

            if (opportunities.length === 0) {
                logger.info("Signals found, but no matching Polymarket markets available.");
                return;
            }

            // Log Discovery
            await AgentLog.create({
                agentId: this.agentId,
                userId: this.userId,
                type: "ANALYSIS",
                message: `Found ${opportunities.length} trade opportunities from news.`,
                metadata: { signals: signals.map(s => s.headline), topOpp: opportunities[0]?.market.question }
            });

            // 5. Select Best Opportunity (Process Top 1 for now to conserve tokens/funds)
            const bestOpp = opportunities[0];
            if (!bestOpp) return;

            const market = bestOpp.market;

            logger.info(`🎯 Targeting Market: "${market.question}" based on signal: "${bestOpp.signal.headline}"`);

            // 6. Final Decision Logic (Re-using context builder)
            // Get User Stats
            const exposure = await Portfolio.getUserExposure(this.userId);
            const user = await prisma.user.findUnique({
                where: { id: this.userId },
                select: { maxTradeAmount: true, maxTotalExposure: true, balance: true }
            });

            const currentExposure = exposure.exposure * (user?.balance || 0);
            const maxBudget = user?.maxTotalExposure || 100;

            // Check budget before expensive LLM call
            if (currentExposure >= maxBudget) {
                logger.warn("Max exposure reached. Skipping trade.");
                return;
            }

            // Construct Prompt for Final Decision (Validate Signal vs Market)
            const provider = LLMRouter.getProvider(agent.llmProvider, agent.llmModel || undefined);

            const decisionPrompt = `
            MARKET: "${market.question}" (ID: ${market.id})
            PRICES: YES=${market.bestBid}, NO=${market.bestAsk}
            
            NEWS SIGNAL: "${bestOpp.signal.headline}" (Confidence: ${bestOpp.signal.confidence}%)
            REASONING: ${bestOpp.signal.reasoning}
            DIRECTION: ${bestOpp.signal.direction}

            PORTFOLIO:
            - Balance: $${user?.balance}
            - Max Trade: $${user?.maxTradeAmount}

            AGENT PROFILE:
            - Name: ${agent.name}
            - Risk Appetite: ${agent.riskProfile}
            
            RISK GUIDELINES:
            - LOW (Conservative): Only trade if Signal Confidence > 85%. Avoid uncertain markets.
            - MEDIUM (Balanced): Trade if Signal Confidence > 70%.
            - HIGH (Aggressive): Trade if Signal Confidence > 55%.
            - DEGEN (High Risk): Trade if Signal Confidence > 30%. YOLO allowed.

            TASK:
            Decide if we should trade this market based on the news signal.
            Verify if the "Signal Direction" aligns with the "Market Question".
            Example: Signal "Bitcoin Bullish" + Market "Will BTC hit 100k?" -> YES.
            Example: Signal "Bitcoin Bullish" + Market "Will BTC crash?" -> NO.

            OUTPUT JSON:
            { "action": "TRADE" | "HOLD", "side": "BUY", "outcome": "YES" | "NO", "amount": number, "reason": "string" }
            `;

            const response = await provider.generateResponse(agent.systemPrompt + "\n" + decisionPrompt, "Make a decision.");
            if (!response) return;

            const jsonStr = response.replace(/```json/g, "").replace(/```/g, "").trim();
            const decision: AgentDecision = JSON.parse(jsonStr);

            // ... (Rest of execution logic is same) ...

            await this.executeDecision(agent, decision, market);

        } catch (err) {
            logger.error({ err }, `❌ Error in AgentLoop for ${this.agentId}`);
        }
    }

    // Helper to keep tick() clean
    private async executeDecision(agent: any, decision: AgentDecision, market: any) {
        // Log Decision
        const marketQuestion = `"${market.question}"`;
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
        if (decision.action === "TRADE" && decision.marketId || decision.action === "TRADE") { // marketId might come from context
            // Fix: decision might not have marketId if prompt didn't ask for it specifically because we gave it ONE market.
            // So we use 'market.id'

            logger.info(`💡 ${agent.name} decides to TRADE: ${decision.side} ${decision.outcome} (${amountStr}) on ${marketQuestion}`);

            const tradeAmount = decision.amount || 10;

            // ** RISK CHECK **
            const { RiskManager } = await import("../services/RiskManager.js");
            const riskCheck = await RiskManager.validateTrade({
                userId: this.userId,
                marketId: market.id,
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
                marketId: market.id,
                marketQuestion: market.question,
                outcome: decision.outcome || "YES",
                amount: tradeAmount,
                side: decision.side || "BUY",
            });

            logger.info(`📤 Job enqueued for agent ${this.agentId}`);
        } else {
            logger.info(`💤 ${agent.name} decides to HOLD. Reason: ${decision.reason}`);
        }
    }
}
