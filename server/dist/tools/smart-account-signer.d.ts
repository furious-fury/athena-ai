import { ethers } from "ethers";
export declare class SmartAccountSigner extends ethers.Signer {
    private client;
    provider?: ethers.providers.Provider;
    constructor(client: any, provider?: ethers.providers.Provider);
    connect(provider: ethers.providers.Provider): ethers.Signer;
    getAddress(): Promise<string>;
    signMessage(message: string | ethers.utils.Bytes): Promise<string>;
    signTransaction(transaction: ethers.providers.TransactionRequest): Promise<string>;
    _signTypedData(domain: any, types: any, value: any): Promise<string>;
}
//# sourceMappingURL=smart-account-signer.d.ts.map