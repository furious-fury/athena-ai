import { Router } from "express";
import { AgentRegistry } from "../agents/AgentRegistry.js";
import { AgentManager } from "../agents/AgentManager.js";
import { prisma } from "../config/database.js";
export const agentRouter = Router();
// GET /api/agents
agentRouter.get("/", async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            res.json({ success: true, agents: [] });
            return;
        }
        const agents = await prisma.agent.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        const runningAgentIds = AgentManager.getRunningAgentIds(); // Use Manager
        const agentsWithStatus = agents.map(a => ({
            ...a,
            isRunning: runningAgentIds.includes(a.id)
        }));
        res.json({ success: true, agents: agentsWithStatus });
    }
    catch (err) {
        console.error("Fetch agents error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch agents" });
    }
});
// POST /api/agents (Create Agent)
agentRouter.post("/", async (req, res) => {
    try {
        const { name, description, riskProfile, userId } = req.body;
        if (!name || !riskProfile) {
            res.status(400).json({ success: false, message: "Name and Risk Profile are required" });
            return;
        }
        // Import prompts generator
        const { generateSystemPrompt } = await import("../agents/prompts.js");
        const systemPrompt = generateSystemPrompt(name, description || "", riskProfile);
        // Save to DB
        const agent = await prisma.agent.create({
            data: {
                name,
                description: description || "Custom Agent",
                riskProfile: riskProfile, // Enum match
                systemPrompt: systemPrompt,
                userId: userId || "demo_user", // Fallback for MVP
                llmProvider: "OPENAI",
                llmModel: "gpt-5-nano",
                isActive: false
            }
        });
        // Register in memory (if keeping registry sync)
        AgentRegistry.register({
            id: agent.id,
            name: agent.name,
            description: agent.description || "",
            prompt: agent.systemPrompt
        });
        res.json({ success: true, agent });
    }
    catch (err) {
        console.error("Create agent error:", err);
        res.status(500).json({ success: false, message: "Failed to create agent" });
    }
});
// POST /api/agents/:id/start
agentRouter.post("/:id/start", async (req, res) => {
    const agentId = req.params.id;
    const userId = req.body.userId || "demo_user";
    try {
        const success = await AgentManager.startAgent(userId, agentId);
        if (!success) {
            return res.status(400).json({ success: false, message: "Agent already running" });
        }
        res.json({ success: true, message: `Agent ${agentId} started` });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});
// POST /api/agents/:id/stop
agentRouter.post("/:id/stop", async (req, res) => {
    const agentId = req.params.id;
    try {
        await AgentManager.stopAgent(agentId); // Always succeeds even if not running
        res.json({ success: true, message: `Agent ${agentId} stopped` });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});
// DELETE /api/agents/:id
agentRouter.delete("/:id", async (req, res) => {
    const agentId = req.params.id;
    try {
        await AgentManager.deleteAgent(agentId);
        res.json({ success: true, message: `Agent ${agentId} deleted` });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});
// POST /auth/polymarket - Store User's Derived API Keys
agentRouter.post("/auth/polymarket", async (req, res) => {
    const { userId, apiKey, apiSecret, apiPassphrase } = req.body;
    if (!userId || !apiKey || !apiSecret || !apiPassphrase) {
        res.status(400).json({ success: false, message: "Missing required credential fields" });
        return;
    }
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                apiKey,
                apiSecret,
                apiPassphrase,
            }
        });
        res.json({ success: true, message: "Trading enabled & keys stored safely." });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to store credentials: " + error.message });
    }
});
//# sourceMappingURL=agent.routes.js.map