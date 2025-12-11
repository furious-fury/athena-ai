import type { WalletClient } from "viem";
import { getAddress } from "viem";

// Import SDK internals directly to ensure exact logic matching
import { createL1Headers } from "@polymarket/clob-client/dist/headers";

const CLOB_API_URL = "https://clob.polymarket.com";

/**
 * Adapter to make a Viem WalletClient look like an Ethers Signer
 * for the purposes of the Polymarket SDK.
 */
class ViemSignerAdapter {
    private walletClient: WalletClient;
    private address: string;

    constructor(walletClient: WalletClient, address: string) {
        this.walletClient = walletClient;
        this.address = getAddress(address); // Store as Checksum Address
    }

    async getAddress() {
        return this.address;
    }

    // The SDK calls signer._signTypedData(domain, types, value) if it thinks it's an Ethers signer
    // We intercept this and forward to Viem.
    async _signTypedData(domain: any, types: any, value: any) {
        // Viem expects strict typing, but we can pass the objects provided by the SDK.
        // We need to remove the "EIP712Domain" from types if it exists, as Viem handles domain separately.
        const { EIP712Domain, ...restTypes } = types;

        // SDK headers inspection showed it passes chainId 1 in domain.
        // Viem's signTypedData will use this domain.

        return await this.walletClient.signTypedData({
            account: this.address as `0x${string}`,
            domain: domain,
            types: restTypes,
            primaryType: "ClobAuth",
            message: value,
        });
    }

    // Fallback if SDK calls standard signTypedData
    async signTypedData(domain: any, types: any, value: any) {
        return this._signTypedData(domain, types, value);
    }
}

/**
 * Derives API Key credentials for the User from the Polymarket CLOB
 * using the official SDK's internal logic.
 */
export async function deriveClobApiKey(walletClient: WalletClient, address: string) {
    console.log("[clobAuth] Starting credentials derivation via SDK Adapter...");

    // 1. Create Adapter
    const signer = new ViemSignerAdapter(walletClient, address);

    // 2. Define Parameters
    const nonce = 0;
    const chainId = 1; // SDK expects Mainnet ChainID 1 for Auth
    const timestamp = Math.floor(Date.now() / 1000);

    // 3. Generate Headers using SDK function
    console.log("[clobAuth] Calling createL1Headers...");
    // @ts-expect-error Using custom provider type - Adapter doesn't fully implement Signer interface but has required methods
    const headers = await createL1Headers(signer as any, chainId, nonce, timestamp);
    console.log("[clobAuth] Generated Key Headers:", headers);

    // 4. Send Request 
    // We use the headers exactly as generated (underscores).
    console.log("[clobAuth] Sending request with headers:", headers);

    const response = await fetch(`${CLOB_API_URL}/auth/derive-api-key`, {
        method: "GET",
        headers: headers as Record<string, string>,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to derive API key: ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}
