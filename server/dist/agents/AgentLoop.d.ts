export declare class AgentLoop {
    private agentId;
    private userId;
    private running;
    private interval;
    constructor(userId: string, agentId: string);
    start(intervalMs?: number): void;
    stop(): void;
    private tick;
}
//# sourceMappingURL=AgentLoop.d.ts.map