import { TradeService } from "../services/TradeService.js";
import { PortfolioRedis } from "../models/Portfolio.js";
import PQueue from "p-queue"; // npm install p-queue
import { logger } from "../config/logger.js";
/**
 * Worker for processing a single agent's queue
 */
export class AgentWorker {
    constructor(agentId, concurrency = 2) {
        this.running = false;
        this.agentId = agentId;
        this.queue = new PQueue({ concurrency }); // concurrency limit
    }
    /**
     * Start processing the queue
     */
    async start() {
        this.running = true;
        logger.info(`🟢 AgentWorker started for ${this.agentId}`);
        while (this.running) {
            try {
                const job = await PortfolioRedis.dequeueAgentJob(this.agentId);
                if (!job) {
                    // No job, wait a bit
                    await new Promise((r) => setTimeout(r, 1000));
                    continue;
                }
                logger.info(`📥 Worker ${this.agentId} picked up job: ${job.side} ${job.amount} on ${job.marketId}`);
                // Schedule job in the queue with retry
                this.queue.add(() => this.processJobWithRetry(job));
            }
            catch (err) {
                logger.error(`❌ Error in worker loop for agent ${this.agentId}`, err);
            }
        }
    }
    /**
     * Process job with retry logic
     */
    async processJobWithRetry(job, retries = 3, delay = 2000) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const result = await TradeService.executeAgentTrade(job);
                // Record trade for cooldown tracking
                const { RiskManager } = await import("../services/RiskManager.js");
                await RiskManager.recordTrade(job.userId);
                logger.info({ job, result }, `✅ Trade executed for ${job.userId}, attempt ${attempt}`);
                return result;
            }
            catch (err) {
                logger.warn({ job, attempt, err }, `⚠️ Trade attempt ${attempt} failed for ${job.userId}`);
                if (attempt < retries) {
                    await new Promise((r) => setTimeout(r, delay));
                }
                else {
                    logger.error({ job, err }, `❌ Trade failed after ${retries} attempts`);
                }
            }
        }
    }
    stop() {
        this.running = false;
        logger.info(`🛑 AgentWorker stopped for ${this.agentId}`);
    }
}
//# sourceMappingURL=AgentWorker.js.map