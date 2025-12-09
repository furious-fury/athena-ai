export declare function check_risk({ userId }: {
    userId: string;
}): Promise<{
    allowed: boolean;
    reason: string;
} | {
    allowed: boolean;
    reason?: never;
}>;
//# sourceMappingURL=risk.d.ts.map