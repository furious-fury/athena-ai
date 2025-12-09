import { redis } from "../config/redis.js";

const QUEUE_NAME = "agent:tradeQueue";
const RETRY_KEY = "agent:retryCounts";
const MAX_RETRIES = 5;

// Concurrency limit (e.g., 3 jobs at a time)
const CONCURRENCY_LIMIT = 3;
const ACTIVE_WORKERS_KEY = "agent:activeWorkers";

export const Queue = {
    // Push job (FIFO using RPUSH)
    async enqueue(job: any) {
        await redis.rPush(QUEUE_NAME, JSON.stringify(job));
    },

    // Schedule a delayed job
    async schedule(job: any, delaySeconds: number) {
        const runAt = Date.now() + delaySeconds * 1000;
        await redis.zAdd("agent:delayedJobs", { score: runAt, value: JSON.stringify(job) });
    },

    // Move due delayed jobs into main queue
    async processScheduledJobs() {
        const now = Date.now();
        const jobs = await redis.zRangeByScore("agent:delayedJobs", 0, now);

        if (jobs.length > 0) {
            const pipeline = redis.multi();

            for (const job of jobs) {
                pipeline.rPush(QUEUE_NAME, job);
                pipeline.zRem("agent:delayedJobs", job);
            }

            await pipeline.exec();
        }
    },

    // Fetch next job (returns null if none)
    async dequeue() {
        const jobString = await redis.lPop(QUEUE_NAME);
        return jobString ? JSON.parse(jobString) : null;
    },

    // Track workers to enforce concurrency
    async tryAcquireWorker(): Promise<boolean> {
        const active = await redis.incr(ACTIVE_WORKERS_KEY);
        if (active > CONCURRENCY_LIMIT) {
            await redis.decr(ACTIVE_WORKERS_KEY);
            return false;
        }
        return true;
    },

    async releaseWorker() {
        await redis.decr(ACTIVE_WORKERS_KEY);
    },

    // Retry logic
    async shouldRetry(jobId: string): Promise<boolean> {
        const count = await redis.hIncrBy(RETRY_KEY, jobId, 1);
        return count <= MAX_RETRIES;
    },

    async clearRetry(jobId: string) {
        await redis.hDel(RETRY_KEY, jobId);
    },
};
