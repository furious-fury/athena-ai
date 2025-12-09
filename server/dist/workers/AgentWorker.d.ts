import PQueue from "p-queue";
/**
 * Worker for processing a single agent's queue
 */
export declare class AgentWorker {
    agentId: string;
    running: boolean;
    queue: PQueue;
    constructor(agentId: string, concurrency?: number);
    /**
     * Start processing the queue
     */
    start(): Promise<void>;
    /**
     * Process job with retry logic
     */
    private processJobWithRetry;
    stop(): void;
}
//# sourceMappingURL=AgentWorker.d.ts.map