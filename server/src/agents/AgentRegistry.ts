// src/agents/AgentRegistry.ts
export interface AgentMetadata {
    id: string;
    name: string;
    description: string;
    prompt: string;
    createdAt: Date;
    updatedAt: Date;
}

export class AgentRegistry {
    private static agents: Map<string, AgentMetadata> = new Map();

    // Register a new agent
    static register(agent: Omit<AgentMetadata, "createdAt" | "updatedAt">) {
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
    static update(agentId: string, data: Partial<Omit<AgentMetadata, "id" | "createdAt">>) {
        const agent = this.agents.get(agentId);
        if (!agent) throw new Error(`Agent ${agentId} not found`);
        const updated = { ...agent, ...data, updatedAt: new Date() };
        this.agents.set(agentId, updated);
    }

    // Fetch agent metadata
    static get(agentId: string): AgentMetadata | undefined {
        return this.agents.get(agentId);
    }

    // List all agents
    static list(): AgentMetadata[] {
        return Array.from(this.agents.values());
    }

    // Remove an agent
    static remove(agentId: string) {
        this.agents.delete(agentId);
    }
}
