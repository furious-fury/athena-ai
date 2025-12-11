import { Router } from "express";
import { AgentRegistry } from "../agents/AgentRegistry.js";
import { AgentManager } from "../agents/AgentManager.js";
import { prisma } from "../config/database.js";

export const agentRouter = Router();

// GET /api/agents
agentRouter.get("/", async (req, res) => {
    try {
        const userId = req.query.userId as string;

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
    } catch (err) {
        console.error("Fetch agents error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch agents" });
    }
});

// POST /api/agents (Create Agent)
agentRouter.post("/", async (req, res) => {
    try {
        const { name, description, riskProfile, userId, stopLossPercent, takeProfitPercent } = req.body;

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
                llmModel: "gpt-4o-mini",
                stopLossPercent: stopLossPercent ? parseFloat(stopLossPercent) : 20.0,
                takeProfitPercent: takeProfitPercent ? parseFloat(takeProfitPercent) : 100.0,
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
    } catch (err) {
        console.error("Create agent error:", err);
        res.status(500).json({ success: false, message: "Failed to create agent" });
    }
});

// PUT /api/agents/:id (Update Agent)
agentRouter.put("/:id", async (req, res) => {
    try {
        const agentId = req.params.id;
        const { name, description, riskProfile, stopLossPercent, takeProfitPercent, userId } = req.body;

        // Verify ownership (if necessary, simple check)
        const existing = await prisma.agent.findUnique({ where: { id: agentId } });
        if (!existing) {
            res.status(404).json({ success: false, message: "Agent not found" });
            return;
        }
        if (userId && existing.userId !== userId) {
            res.status(403).json({ success: false, message: "Unauthorized" });
            return;
        }

        // If risk profile changed, might want to update system prompt, but keeping it simple for now
        // or regenerate if needed. Ideally we regenerate prompt if risk/name changes.
        let systemPrompt = existing.systemPrompt;
        if (riskProfile && riskProfile !== existing.riskProfile) {
            const { generateSystemPrompt } = await import("../agents/prompts.js");
            systemPrompt = generateSystemPrompt(name || existing.name, description || existing.description || "", riskProfile);
        }

        // Build update object dynamically to satisfy exactOptionalPropertyTypes
        const updateData: any = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (riskProfile) updateData.riskProfile = riskProfile;
        if (stopLossPercent) updateData.stopLossPercent = parseFloat(stopLossPercent);
        if (takeProfitPercent) updateData.takeProfitPercent = parseFloat(takeProfitPercent);
        if (systemPrompt) updateData.systemPrompt = systemPrompt;

        const agent = await prisma.agent.update({
            where: { id: agentId },
            data: updateData
        });

        res.json({ success: true, agent });
    } catch (err) {
        console.error("Update agent error:", err);
        res.status(500).json({ success: false, message: "Failed to update agent" });
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
    } catch (e: any) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// POST /api/agents/:id/stop
agentRouter.post("/:id/stop", async (req, res) => {
    const agentId = req.params.id;

    try {
        await AgentManager.stopAgent(agentId); // Always succeeds even if not running
        res.json({ success: true, message: `Agent ${agentId} stopped` });
    } catch (e: any) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// DELETE /api/agents/:id
agentRouter.delete("/:id", async (req, res) => {
    const agentId = req.params.id;
    try {
        await AgentManager.deleteAgent(agentId);
        res.json({ success: true, message: `Agent ${agentId} deleted` });
    } catch (e: any) {
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
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to store credentials: " + error.message });
    }
});
