import { ethers } from 'ethers';
import { EthersAdapter } from '@safe-global/protocol-kit';
import { SafeFactory } from '@safe-global/protocol-kit';
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
export async function predictSafeAddress(rpcUrl, deployerPrivateKey, userEOA, saltNonce = "0") {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(deployerPrivateKey, provider);
    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer
    });
    // Initialize Safe Factory
    const safeFactory = await SafeFactory.create({ ethAdapter });
    const safeAccountConfig = {
        owners: [userEOA],
        threshold: 1, // 1-of-1 Safe
        // validation modules can be added here if needed during setup, 
        // but typically enabled post-deploy or via setup call.
        // We will just deploy a standard 1/1 Safe first.
    };
    // Predict the address
    const predictedAddress = await safeFactory.predictSafeAddress(safeAccountConfig, saltNonce);
    return {
        predictedAddress,
        safeAccountConfig,
        saltNonce
    };
}
//# sourceMappingURL=predictSafe.js.map