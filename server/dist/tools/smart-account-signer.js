import { ethers } from "ethers";
export class SmartAccountSigner extends ethers.Signer {
    constructor(client, provider) {
        super();
        this.client = client;
        this.provider = provider;
    }
    connect(provider) {
        return new SmartAccountSigner(this.client, provider);
    }
    async getAddress() {
        return this.client.account.address;
    }
    async signMessage(message) {
        return this.client.signMessage({
            message: typeof message === 'string' ? message : { raw: message }
        });
    }
    async signTransaction(transaction) {
        throw new Error("SmartAccountSigner: signTransaction not implemented (use sendTransaction directly)");
    }
    async _signTypedData(domain, types, value) {
        // EIP-712 Signing for Permissionless Client
        delete types.EIP712Domain;
        console.log("[SmartAccountSigner] _signTypedData START (Safe Mode)");
        try {
            // Strategy: Direct Original Owner Signing with SafeMessage Wrapping
            // Safe (v1.3 and v1.4) usually expects EIP-712 signatures to be signed over SafeMessage(hash)
            // when coming from an OWNER EOA.
            const originalOwner = this.client.originalOwner;
            if (originalOwner && typeof originalOwner.signTypedData === 'function') {
                console.log("[SmartAccountSigner] ✨ Signing with SafeMessage wrapping for Safe");
                // 1. Calculate the hash of the actual data
                const dataHash = ethers.utils._TypedDataEncoder.hash(domain, types, value);
                // 2. Wrap in SafeMessage
                const chainId = await this.provider?.getNetwork().then(n => n.chainId) || 137;
                const safeDomain = {
                    chainId: chainId,
                    verifyingContract: this.client.account.address
                };
                const safeTypes = {
                    SafeMessage: [{ name: "message", type: "bytes" }]
                };
                const safeValue = { message: dataHash };
                console.log("[SmartAccountSigner] Signing SafeMessage(hash)...");
                const signature = await originalOwner.signTypedData({
                    domain: safeDomain,
                    types: safeTypes,
                    primaryType: 'SafeMessage',
                    message: safeValue
                });
                return signature;
            }
            console.log("[SmartAccountSigner] Fallback: this.client.signTypedData");
            return await this.client.signTypedData({
                domain,
                types,
                primaryType: Object.keys(types)[0],
                message: value
            });
        }
        catch (err) {
            console.error("[SmartAccountSigner] CRITICAL FAILURE in _signTypedData:", err);
            throw err;
        }
    }
}
//# sourceMappingURL=smart-account-signer.js.map