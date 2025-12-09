import { ethers } from 'ethers';
import { EthersAdapter } from '@safe-global/protocol-kit';
import Safe from '@safe-global/protocol-kit';
export async function createEnableModuleTx(rpcUrl, safeAddress, moduleAddress, userPrivateKey // To simulate User signing
) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const userWallet = new ethers.Wallet(userPrivateKey, provider);
    const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: userWallet });
    // Connect to Safe as Owner
    const safeSdk = await Safe.create({ ethAdapter, safeAddress });
    // Create transaction to enable module
    const safeTransaction = await safeSdk.createEnableModuleTx(moduleAddress);
    // Sign it (User Action)
    const signedSafeTransaction = await safeSdk.signTransaction(safeTransaction);
    return signedSafeTransaction;
}
export async function relayEnableModuleTx(rpcUrl, safeAddress, signedSafeTx, relayerPrivateKey) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider);
    const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: relayerWallet });
    // Connect to Safe as Relayer (not owner, just executor)
    const safeSdk = await Safe.create({ ethAdapter, safeAddress });
    console.log(`[Relayer] Executing EnableModule Tx on Safe ${safeAddress}...`);
    const executeTxResponse = await safeSdk.executeTransaction(signedSafeTx);
    // Wait for execution
    const receipt = await executeTxResponse.transactionResponse?.wait();
    return receipt;
}
//# sourceMappingURL=enableModule.js.map