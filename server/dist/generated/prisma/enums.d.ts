export declare const RiskProfile: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly DEGEN: "DEGEN";
};
export type RiskProfile = (typeof RiskProfile)[keyof typeof RiskProfile];
export declare const Side: {
    readonly BUY: "BUY";
    readonly SELL: "SELL";
};
export type Side = (typeof Side)[keyof typeof Side];
export declare const TradeStatus: {
    readonly PENDING: "PENDING";
    readonly FILLED: "FILLED";
    readonly CANCELLED: "CANCELLED";
    readonly FAILED: "FAILED";
};
export type TradeStatus = (typeof TradeStatus)[keyof typeof TradeStatus];
export declare const LLMProvider: {
    readonly OPENAI: "OPENAI";
    readonly ANTHROPIC: "ANTHROPIC";
    readonly CUSTOM: "CUSTOM";
};
export type LLMProvider = (typeof LLMProvider)[keyof typeof LLMProvider];
//# sourceMappingURL=enums.d.ts.map