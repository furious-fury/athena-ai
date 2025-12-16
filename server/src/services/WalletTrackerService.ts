
import { prisma } from "../config/database.js";
import { get_trades_by_address, get_positions_by_address } from "../tools/polymarket.js";

export class WalletTrackerService {
    private static intervalId: NodeJS.Timeout | null = null;
    private static isRunning = false;

    static startTracking() {
        if (this.intervalId) return; // Already running

        console.log("[WalletTracker] 🚀 Service started data sync every 60s");

        // Run immediately
        this.syncAll();

        // Schedule
        this.intervalId = setInterval(() => this.syncAll(), 60000);
    }

    static stopTracking() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private static async syncAll() {
        if (this.isRunning) return; // Prevent overlap
        this.isRunning = true;

        try {
            // 1. Get all unique addresses tracked to minimize API calls
            const tracked = await prisma.trackedWallet.findMany({ select: { address: true } });
            if (tracked.length === 0) return;

            // Simple dedup
            const uniqueAddresses = [...new Set(tracked.map(t => t.address))];
            console.log(`[WalletTracker] Syncing ${uniqueAddresses.length} unique wallets...`);

            // 2. Fetch and Update
            for (const address of uniqueAddresses) {
                try {
                    // Fetch in parallel
                    const [trades, positions] = await Promise.all([
                        get_trades_by_address(address),
                        get_positions_by_address(address)
                    ]);

                    // Update all records for this address
                    await prisma.trackedWallet.updateMany({
                        where: { address },
                        data: {
                            cachedTrades: trades as any,
                            cachedPositions: positions as any,
                            lastUpdated: new Date()
                        }
                    });
                    // Be nice to the API
                    await new Promise(r => setTimeout(r, 200));
                } catch (e) {
                    console.error(`[WalletTracker] Failed to update ${address}:`, e);
                }
            }
        } catch (error) {
            console.error("[WalletTracker] Sync error:", error);
        } finally {
            this.isRunning = false;
        }
    }
}
