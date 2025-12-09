export declare class AgentManager {
    private static activeLoops;
    static startAgent(userId: string, agentId: string): Promise<boolean>;
    static stopAgent(agentId: string): Promise<boolean>;
    /**
     * Stop and delete an agent entirely
     */
    static deleteAgent(agentId: string): Promise<boolean>;
    static isRunning(agentId: string): boolean;
    static getRunningAgentIds(): string[];
    static restoreAgents(): Promise<void>;
}
//# sourceMappingURL=AgentManager.d.ts.map