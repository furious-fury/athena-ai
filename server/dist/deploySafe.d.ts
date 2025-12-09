/**
 * Deploys a Gnosis Safe for a user if it doesn't exist.
 *
 * Modes:
 * - DIRECT: Uses the server's local private key to pay gas and deploy.
 * - POLY_RELAYER: Calls a mock relayer function (stub).
 */
export declare function deploySafe(rpcUrl: string, deployerPrivateKey: string, userEOA: string, saltNonce?: string): Promise<{
    address: any;
    isNew: boolean;
    txHash?: never;
} | {
    address: any;
    isNew: boolean;
    txHash: string;
}>;
//# sourceMappingURL=deploySafe.d.ts.map