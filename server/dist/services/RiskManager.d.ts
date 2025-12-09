export interface TradeValidationRequest {
    userId: string;
    marketId: string;
    amount: number;
}
export interface RiskCheckResult {
    allowed: boolean;
    reason?: string;
}
export declare class RiskManager {
    /**
     * Validate a trade against all risk limits
     */
    static validateTrade(request: TradeValidationRequest): Promise<RiskCheckResult>;
    /**
     * Check if user is within cooldown period
     */
    private static checkCooldown;
    /**
     * Check market-specific exposure limit
     */
    private static checkMarketExposure;
    /**
     * Check total exposure across all markets
     */
    private static checkTotalExposure;
    /**
     * Record a successful trade (update cooldown)
     */
    static recordTrade(userId: string): Promise<void>;
}
//# sourceMappingURL=RiskManager.d.ts.map