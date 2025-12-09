export class AgentRegistry {
    // Register a new agent
    static register(agent) {
        if (this.agents.has(agent.id)) {
            throw new Error(`Agent with id ${agent.id} already exists`);
        }
        const now = new Date();
        this.agents.set(agent.id, {
            ...agent,
            createdAt: now,
            updatedAt: now,
        });
    }
    // Update agent prompt or description
    static update(agentId, data) {
        const agent = this.agents.get(agentId);
        if (!agent)
            throw new Error(`Agent ${agentId} not found`);
        const updated = { ...agent, ...data, updatedAt: new Date() };
        this.agents.set(agentId, updated);
    }
    // Fetch agent metadata
    static get(agentId) {
        return this.agents.get(agentId);
    }
    // List all agents
    static list() {
        return Array.from(this.agents.values());
    }
    // Remove an agent
    static remove(agentId) {
        this.agents.delete(agentId);
    }
}
AgentRegistry.agents = new Map();
//# sourceMappingURL=AgentRegistry.js.map