import { ethers } from 'ethers';
export async function checkSafeDeployed(rpcUrl, safeAddress) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const code = await provider.getCode(safeAddress);
    return code !== '0x';
}
//# sourceMappingURL=checkSafeDeployed.js.map