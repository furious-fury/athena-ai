import { get_positions, place_trade, type TradeParams } from "../tools/polymarket.js";
import { Portfolio, type UpdateAfterTradeParams } from "../models/Portfolio.js";
import { check_risk } from "../tools/risk.js";
import { logger } from "../config/logger.js";

export interface TradeExecution {
    marketId: string;
    outcome: string;
    amount: number;
    side: "BUY" | "SELL";
}

export interface AgentRunResult {
    success: boolean;
    trade?: any;
    reason?: string;
}

export class AgentRunner {
    userId: string;
    agentId: string;

    constructor(userId: string, agentId: string) {
        this.userId = userId;
        this.agentId = agentId;
    }

    async executeTrade(trade: TradeExecution): Promise<AgentRunResult> {
        try {
            // ✅ 1. Check risk
            const riskCheck = await check_risk({ userId: this.userId });
            if (!riskCheck.allowed) {
                return { success: false, reason: riskCheck.reason || "Risk check failed" };
            }

            // ✅ 2. Place trade via Polymarket
            const tradeResult = await place_trade({
                ...trade,
                userId: this.userId,
                agentId: this.agentId, // fix missing agentId
            } as TradeParams);

            // ✅ 3. Update portfolio
            const updateParams: UpdateAfterTradeParams & { outcome: string } = {
                userId: this.userId,
                agentId: this.agentId,
                marketId: trade.marketId,
                amount: trade.amount,
                side: trade.side,
                price: tradeResult.price,
                txId: tradeResult.txId,
                outcome: trade.outcome, // add required outcome
            };

            await Portfolio.updateAfterTrade(updateParams);

            logger.info(tradeResult, `✅ Trade executed for user ${this.userId}`);
            return { success: true, trade: tradeResult };
        } catch (err: any) {
            logger.error(`❌ Trade failed for user ${this.userId}`, err);
            return { success: false, reason: err?.message || "Unknown error" };
        }
    }

    async getPositions() {
        return await get_positions(this.userId); // pass as object
    }
}
