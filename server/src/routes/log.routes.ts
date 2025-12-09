import { Router } from "express";
import { AgentLog } from "../models/AgentLog.js";

export const logRouter = Router();

// GET /api/logs/agent/:agentId
logRouter.get("/agent/:agentId", async (req, res) => {
    try {
        const { agentId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;

        const logs = await AgentLog.getRecent(agentId, limit);
        res.json({ success: true, logs });
    } catch (error: any) {
        console.error("[LogRoutes] Failed to fetch agent logs:", error);
        res.status(500).json({ success: false, error: "Failed to fetch logs" });
    }
});

// GET /api/logs/user/:userId
logRouter.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit as string) || 100;

        const logs = await AgentLog.getByUser(userId, limit);
        res.json({ success: true, logs });
    } catch (error: any) {
        console.error("[LogRoutes] Failed to fetch user logs:", error);
        res.status(500).json({ success: false, error: "Failed to fetch logs" });
    }
});

// DELETE /api/logs/prune
logRouter.delete("/prune", async (req, res) => {
    try {
        const days = parseInt(req.query.days as string) || 7;
        const { LogCleanupService } = await import("../services/LogCleanupService.js");

        const count = await LogCleanupService.pruneOldLogs(days);
        res.json({ success: true, message: `Pruned ${count} logs older than ${days} days` });
    } catch (error: any) {
        console.error("[LogRoutes] Prune failed:", error);
        res.status(500).json({ success: false, error: "Prune failed" });
    }
});
