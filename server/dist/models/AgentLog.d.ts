/**
 * Agent Log Helper
 */
export declare class AgentLog {
    /**
     * Create a new agent log entry
     */
    static create(params: {
        agentId: string;
        userId: string;
        type: 'ANALYSIS' | 'DECISION' | 'TRADE' | 'RISK_BLOCK' | 'ERROR';
        message: string;
        metadata?: any;
    }): Promise<any>;
    /**
     * Get recent logs for an agent
     */
    static getRecent(agentId: string, limit?: number): Promise<any>;
    /**
     * Get logs for a user across all their agents
     */
    static getByUser(userId: string, limit?: number): Promise<any>;
    /**
     * Delete old logs (cleanup)
     */
    static deleteOlderThan(days: number): Promise<any>;
}
//# sourceMappingURL=AgentLog.d.ts.map