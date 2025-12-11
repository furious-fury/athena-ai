import { prisma } from "../config/database.js";

/**
 * Data Sanitization - Remove sensitive information from logs
 */
function sanitizeLogData(data: any): any {
    if (!data) return data;

    // Remove sensitive fields
    const sensitive = ['apiKey', 'secret', 'privateKey', 'password', 'token', 'accessToken'];
    const sanitized = JSON.parse(JSON.stringify(data)); // Deep copy

    function removeSensitiveFields(obj: any): void {
        if (typeof obj !== 'object' || obj === null) return;

        for (const key in obj) {
            if (sensitive.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
                obj[key] = '[REDACTED]';
            } else if (typeof obj[key] === 'object') {
                removeSensitiveFields(obj[key]);
            }
        }
    }

    removeSensitiveFields(sanitized);

    // Sanitize error messages
    if (sanitized.error) {
        sanitized.error = getSafeErrorMessage(sanitized.error);
    }

    return sanitized;
}

/**
 * Convert internal errors to user-friendly messages
 */
function getSafeErrorMessage(error: any): string {
    const errorMsg = typeof error === 'string' ? error : error?.message || String(error);

    // Map internal errors to user-friendly messages
    if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
        return 'Service busy, retrying shortly';
    }
    if (errorMsg.includes('API') || errorMsg.includes('401') || errorMsg.includes('403')) {
        return 'Market data temporarily unavailable';
    }
    if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        return 'Connection issue, retrying...';
    }
    if (errorMsg.includes('timeout')) {
        return 'Request timed out';
    }

    // Generic fallback
    return 'Processing error occurred';
}

/**
 * Agent Log Helper
 */
export class AgentLog {
    /**
     * Create a new agent log entry
     */
    static async create(params: {
        agentId: string;
        userId: string;
        type: 'ANALYSIS' | 'DECISION' | 'TRADE' | 'RISK_BLOCK' | 'ERROR' | 'DATA_FETCH' | 'RISK_ASSESSMENT';
        message: string;
        metadata?: any;
    }) {
        try {
            // Sanitize metadata before storing
            const sanitizedMetadata = params.metadata ? sanitizeLogData(params.metadata) : null;

            // Type assertion to work around TypeScript cache issues
            return await (prisma as any).agentLog.create({
                data: {
                    ...params,
                    metadata: sanitizedMetadata,
                },
            });
        } catch (error) {
            console.error('[AgentLog] Failed to create log:', error);
            // Don't throw - logging failures shouldn't break agent flow
            return null;
        }
    }

    /**
     * Get recent logs for an agent
     */
    static async getRecent(agentId: string, limit = 50) {
        return (prisma as any).agentLog.findMany({
            where: { agentId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Get logs for a user across all their agents
     */
    static async getByUser(userId: string, limit = 100) {
        return (prisma as any).agentLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                agent: {
                    select: { name: true },
                },
            },
        });
    }

    /**
     * Delete old logs (cleanup)
     */
    static async deleteOlderThan(days: number) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return (prisma as any).agentLog.deleteMany({
            where: {
                createdAt: {
                    lt: cutoff,
                },
            },
        });
    }
}
