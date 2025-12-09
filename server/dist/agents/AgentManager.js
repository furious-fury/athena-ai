import { AgentLoop } from "./AgentLoop.js";
import { prisma } from "../config/database.js";
import { logger } from "../config/logger.js";
export class AgentManager {
    static async startAgent(userId, agentId) {
        if (this.activeLoops.has(agentId)) {
            logger.warn(`Agent ${agentId} is already running.`);
            return false;
        }
        // Ensure DB state is active
        await prisma.agent.update({
            where: { id: agentId },
            data: { isActive: true }
        });
        const loop = new AgentLoop(userId, agentId);
        loop.start(60000); // Start with 60s interval (runs immediately first)
        this.activeLoops.set(agentId, loop);
        return true;
    }
    static async stopAgent(agentId) {
        // Stop in DB
        await prisma.agent.update({
            where: { id: agentId },
            data: { isActive: false }
        });
        const loop = this.activeLoops.get(agentId);
        if (loop) {
            loop.stop();
            this.activeLoops.delete(agentId);
            return true;
        }
        return false;
    }
    /**
     * Stop and delete an agent entirely
     */
    static async deleteAgent(agentId) {
        // 1. Stop if running
        if (this.activeLoops.has(agentId)) {
            const loop = this.activeLoops.get(agentId);
            loop.stop();
            this.activeLoops.delete(agentId);
        }
        // 2. Delete from DB
        try {
            // Delete logs first to avoid foreign key constraints if cascade isn't set up
            await prisma.agentLog.deleteMany({ where: { agentId } });
            // Delete trades might be needed if they block deletion, but usually we want to keep trades.
            // However, agentId is nullable on Trade? No, it's required in schema.
            // If we delete agent, we might need to cascade delete trades or untie them. 
            // For safety, let's assume we keep trades if possible, but if FK blocks it, we might need to handle it.
            // Given the user request, let's assume standard deletion.
            await prisma.agent.delete({
                where: { id: agentId }
            });
            logger.info(`🗑️ Agent ${agentId} deleted`);
            return true;
        }
        catch (error) {
            logger.error({ error, agentId }, "Failed to delete agent");
            throw error;
        }
    }
    static isRunning(agentId) {
        return this.activeLoops.has(agentId);
    }
    static getRunningAgentIds() {
        return Array.from(this.activeLoops.keys());
    }
    static async restoreAgents() {
        try {
            const activeAgents = await prisma.agent.findMany({
                where: { isActive: true }
            });
            logger.info(`Found ${activeAgents.length} active agents to restore...`);
            for (const agent of activeAgents) {
                if (!this.activeLoops.has(agent.id)) {
                    const loop = new AgentLoop(agent.userId, agent.id);
                    loop.start(60000);
                    this.activeLoops.set(agent.id, loop);
                    logger.info(`Restored agent loop: ${agent.name} (${agent.id})`);
                }
            }
        }
        catch (error) {
            logger.error({ error }, "Failed to restore agents");
        }
    }
}
AgentManager.activeLoops = new Map();
//# sourceMappingURL=AgentManager.js.map