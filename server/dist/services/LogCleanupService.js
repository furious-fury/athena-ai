import { prisma } from "../config/database.js";
import { logger } from "../config/logger.js";
export class LogCleanupService {
    /**
     * Delete logs older than X days
     * @param daysToKeep Number of days of logs to retain (default: 7)
     */
    static async pruneOldLogs(daysToKeep = 7) {
        try {
            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - daysToKeep);
            const result = await prisma.agentLog.deleteMany({
                where: {
                    createdAt: {
                        lt: dateThreshold
                    }
                }
            });
            logger.info(`[LogCleanup] Pruned ${result.count} logs older than ${daysToKeep} days.`);
            return result.count;
        }
        catch (error) {
            logger.error({ error }, "[LogCleanup] Failed to prune logs");
            throw error;
        }
    }
}
//# sourceMappingURL=LogCleanupService.js.map