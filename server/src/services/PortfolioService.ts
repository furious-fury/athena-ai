import { Portfolio } from "../models/Portfolio.js";
import { Side } from "../generated/prisma/client.js";
import { get_positions, get_balance } from "../tools/polymarket.js";

export interface TradeRecord {
    userId: string;
    agentId: string;
    marketId: string;
    outcome: string;
    amount: number;
    side: "BUY" | "SELL";
    txId: string;
    price: number;
}

export class PortfolioService {
    /**
     * Update a user's position after a trade.
     * Returns the updated position including PnL calculation.
     */
    static async updatePosition(
        userId: string,
        agentId: string,
        marketId: string,
        side: Side,
        quantity: number,
        price: number,
        currentPrice: number,
        outcome: string,
        marketTitle?: string,
    ) {
        return await Portfolio.updatePositionAfterTrade(
            userId,
            agentId,
            marketId,
            side,
            quantity,
            price,
            currentPrice,
            outcome,
            marketTitle,
        );
    }

    /**
     * Save executed trade details for history/logging
     */
    static async saveTrade(trade: TradeRecord) {
        return await Portfolio.saveTrade(trade);
    }

    /**
     * Fetch current positions for a user or agent from Polymarket API
     */
    static async getAllUserPositions(userId: string) {
        // Fetch from Gamma API via polymarket tool
        const apiPositions: any[] = await get_positions(userId); // Ensure this is imported

        // Map to frontend expected format
        return apiPositions.map((p: any) => ({
            id: p.asset || p.instrument || Math.random().toString(), // fallback ID
            userId,
            marketId: p.market || "unknown",
            marketTitle: p.title || p.market, // Gamma usually provides title
            outcome: p.outcome || "YES", // Default or parsed
            shares: parseFloat(p.size || "0"),
            avgEntryPrice: parseFloat(p.price || "0"),
            exposure: parseFloat(p.value || "0"),
        }));
    }

    /**
     * Fetch user balance (USDC & POL)
     */
    static async getUserBalance(userId: string) {
        return await get_balance(userId);
    }

    /**
     * Fetch PnL for a specific market or overall
     */
    static async getPnL(userId: string, marketId?: string) {
        // ... (rest currently placeholder)
        return 0;
    }
}
