export interface AgentMetadata {
    id: string;
    name: string;
    description: string;
    prompt: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AgentRegistry {
    private static agents;
    static register(agent: Omit<AgentMetadata, "createdAt" | "updatedAt">): void;
    static update(agentId: string, data: Partial<Omit<AgentMetadata, "id" | "createdAt">>): void;
    static get(agentId: string): AgentMetadata | undefined;
    static list(): AgentMetadata[];
    static remove(agentId: string): void;
}
//# sourceMappingURL=AgentRegistry.d.ts.map