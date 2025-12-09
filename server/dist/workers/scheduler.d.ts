/**
 * Scheduler to manage multiple agent workers
 */
export declare class AgentScheduler {
    private workers;
    /**
     * Start a worker for a given agent
     */
    startAgent(agentId: string): void;
    /**
     * Stop a worker for a given agent
     */
    stopAgent(agentId: string): void;
    /**
     * Start multiple agents
     */
    startAgents(agentIds: string[]): void;
    /**
     * Stop all agents
     */
    stopAll(): void;
    /**
     * List active agents
     */
    getActiveAgents(): string[];
}
//# sourceMappingURL=scheduler.d.ts.map