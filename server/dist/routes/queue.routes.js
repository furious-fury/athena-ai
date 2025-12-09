// src/routes/queue.routes.ts
import { Router } from "express";
import { redis } from "../config/redis.js";
export const queueRouter = Router();
const QUEUE_NAME = "agent:tradeQueue";
const RETRY_KEY = "agent:retryCounts";
const ACTIVE_WORKERS_KEY = "agent:activeWorkers";
const DELAYED_KEY = "agent:delayedJobs";
/**
 * Get queue status summary
 */
queueRouter.get("/status", async (_req, res) => {
    try {
        const queueLength = await redis.lLen(QUEUE_NAME);
        const delayedLength = await redis.zCard(DELAYED_KEY);
        const retries = await redis.hGetAll(RETRY_KEY);
        const activeWorkers = await redis.get(ACTIVE_WORKERS_KEY) || "0";
        res.json({
            queueLength,
            delayedLength,
            retries,
            activeWorkers,
        });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to get queue status", details: err instanceof Error ? err.message : err });
    }
});
/**
 * Get all pending jobs (queued + delayed)
 */
queueRouter.get("/jobs", async (_req, res) => {
    try {
        // Fetch main queue jobs
        const queuedJobsRaw = await redis.lRange(QUEUE_NAME, 0, -1);
        const queuedJobs = queuedJobsRaw.map((j) => JSON.parse(j));
        // Fetch delayed jobs
        const delayedJobsRaw = await redis.zRangeWithScores(DELAYED_KEY, 0, -1);
        const delayedJobs = delayedJobsRaw.map((entry) => ({
            job: JSON.parse(entry.value),
            runAt: new Date(entry.score),
        }));
        res.json({
            queuedJobs,
            delayedJobs,
        });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to get jobs", details: err instanceof Error ? err.message : err });
    }
});
//# sourceMappingURL=queue.routes.js.map