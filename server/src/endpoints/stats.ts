import express from "express";
import { prisma } from "../config/database.js";
import { logger } from "../config/logger.js";

const router = express.Router();

import { AgentManager } from "../agents/AgentManager.js";

// POST /api/stats/stop-agents
router.post("/stop-agents", async (req, res) => {
    try {
        const count = await AgentManager.stopAll();
        res.json({ success: true, stoppedCount: count });
    } catch (error) {
        logger.error({ error }, "Failed to stop agents");
        res.status(500).json({ error: "Failed to stop agents" });
    }
});

// GET /api/stats
router.get("/", async (req, res) => {
    try {
        // 1. Core Counts
        const totalUsers = await prisma.user.count();
        const activeAgents = await prisma.agent.count({ where: { isActive: true } });
        const totalAgents = await prisma.agent.count();

        // 2. Trade Volume
        const tradeAgg = await prisma.trade.aggregate({
            _sum: { amount: true },
            where: { status: "FILLED" }
        });
        const totalVolume = tradeAgg._sum.amount || 0;
        const totalTrades = await prisma.trade.count();

        // 3. Recent Trades (Limit 10)
        const recentTrades = await prisma.trade.findMany({
            // Show all trades regardless of status so admin can see PENDING ones
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { userName: true, walletAddress: true } },
                agent: { select: { name: true } }
            }
        });

        // 4. Top Agents by Trade Count (Simple proxy for activity)
        const topAgents = await prisma.agent.findMany({
            take: 5,
            orderBy: { trades: { _count: "desc" } },
            include: {
                _count: { select: { trades: true } }
            }
        });

        res.json({
            users: { total: totalUsers },
            agents: { active: activeAgents, total: totalAgents },
            trading: { volume: totalVolume, count: totalTrades },
            recentActivity: recentTrades,
            topAgents: topAgents.map(a => ({ name: a.name, tradeCount: a._count.trades }))
        });

    } catch (error) {
        logger.error({ error }, "Failed to fetch stats");
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

export const statsRouter = router;
