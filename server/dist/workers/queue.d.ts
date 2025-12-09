export declare const Queue: {
    enqueue(job: any): Promise<void>;
    schedule(job: any, delaySeconds: number): Promise<void>;
    processScheduledJobs(): Promise<void>;
    dequeue(): Promise<any>;
    tryAcquireWorker(): Promise<boolean>;
    releaseWorker(): Promise<void>;
    shouldRetry(jobId: string): Promise<boolean>;
    clearRetry(jobId: string): Promise<void>;
};
//# sourceMappingURL=queue.d.ts.map