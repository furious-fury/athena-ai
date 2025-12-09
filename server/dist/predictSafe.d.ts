import { SafeAccountConfig } from '@safe-global/protocol-kit';
/**
 * Predicts the Gnosis Safe address for a given user EOA without deploying it.
 *
 * @param rpcUrl The RPC URL to connect to.
 * @param deployerPrivateKey The private key of the server (used to initialize the SDK).
 * @param userEOA The user's wallet address (Owner of the Safe).
 * @param saltNonce A string nonce to ensure unique deterministic addresses. Defaults to "0".
 * @returns Object with predictedAddress and configuration metadata.
 */
export declare function predictSafeAddress(rpcUrl: string, deployerPrivateKey: string, userEOA: string, saltNonce?: string): Promise<{
    predictedAddress: any;
    safeAccountConfig: SafeAccountConfig;
    saltNonce: string;
}>;
//# sourceMappingURL=predictSafe.d.ts.map