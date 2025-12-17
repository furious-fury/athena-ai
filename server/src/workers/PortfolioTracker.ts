import { prisma } from "../config/database.js";
import { PortfolioService } from "../services/PortfolioService.js";

/**
 * Background worker to track portfolio net worth periodically.
 */
export class PortfolioTracker {
    private intervalId: NodeJS.Timeout | null = null;
    private readonly INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

    /**
     * Start the tracker
     */
    start() {
        if (this.intervalId) {
            console.log("⚠ PortfolioTracker already running.");
            return;
        }

        console.log(`[PortfolioTracker] Starting service (Interval: ${this.INTERVAL_MS / 60000}m)`);

        // Run immediately on start
        this.runJob();

        // Schedule periodic runs
        this.intervalId = setInterval(() => {
            this.runJob();
        }, this.INTERVAL_MS);
    }

    /**
     * Stop the tracker
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("[PortfolioTracker] Service stopped.");
        }
    }

    /**
     * The task logic
     */
    private async runJob() {
        try {
            console.log("[PortfolioTracker] Running snapshot job...");
            
            // fetch all users
            // optimization: only fetch users with keys or balance? For now, all users is fine for MVP.
            const users = await prisma.user.findMany({
                select: { id: true }
            });

            console.log(`[PortfolioTracker] Found ${users.length} users to snapshot.`);

            let successCount = 0;
            for (const user of users) {
                try {
                    await PortfolioService.takeSnapshot(user.id);
                    successCount++;
                } catch (e) {
                    console.error(`[PortfolioTracker] Failed to snapshot user ${user.id}`, e);
                }
            }

            console.log(`[PortfolioTracker] Job completed. Success: ${successCount}/${users.length}`);

        } catch (error) {
            console.error("[PortfolioTracker] Job failed:", error);
        }
    }
}
