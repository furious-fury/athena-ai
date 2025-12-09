import "dotenv/config";
import { createPublicClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { toSafeSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { entryPoint06Address } from "viem/account-abstraction";
// Initialize public client for Polygon
const publicClient = createPublicClient({
    chain: polygon,
    transport: http(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com"),
});
// Pimlico Config
const PIMLICO_API_KEY = process.env.PIMLICO_API_KEY;
const TRANSPORT_URL = `https://api.pimlico.io/v2/polygon/rpc?apikey=${PIMLICO_API_KEY}`;
export class SmartWalletService {
    /**
     * Generates a new Pimlico Safe Account (ERC-4337).
     * Returns the address and the private key of the owner.
     */
    static async createOneClickAccount() {
        try {
            // 1. Generate a new private key (EOA)
            const privateKey = generatePrivateKey();
            const signer = privateKeyToAccount(privateKey);
            // 2. Create Safe Account (1.4.1 + EP 0.6)
            // Safe 1.4.1 is the default and only supported version in permissionless for now (beside 1.5.0)
            const safeAccount = await toSafeSmartAccount({
                client: publicClient,
                owners: [signer],
                version: "1.4.1",
                entryPoint: {
                    address: entryPoint06Address,
                    version: "0.6"
                },
            });
            const address = safeAccount.address;
            console.log(`[SmartWallet] Created Safe Account (1.4.1 / EP 0.6): ${address}`);
            return {
                address,
                privateKey: privateKey,
            };
        }
        catch (error) {
            console.error("Error creating one-click account:", error);
            throw error;
        }
    }
    /**
     * Sends a gasless transaction using the Pimlico Paymaster.
     */
    static async sendTransaction(ownerPrivateKey, to, value, data = "0x") {
        try {
            const privateKey = ownerPrivateKey;
            const signer = privateKeyToAccount(privateKey);
            // 1. Reconstruct the Account
            const safeAccount = await toSafeSmartAccount({
                client: publicClient,
                owners: [signer],
                version: "1.4.1",
                entryPoint: {
                    address: entryPoint06Address,
                    version: "0.6"
                },
            });
            // 2. Create Pimlico Client (Bundler & Paymaster)
            const pimlicoClient = createPimlicoClient({
                transport: http(TRANSPORT_URL),
                entryPoint: { address: entryPoint06Address, version: "0.6" },
            });
            const smartAccountClient = createSmartAccountClient({
                account: safeAccount,
                chain: polygon,
                bundlerTransport: http(TRANSPORT_URL),
                paymaster: pimlicoClient,
                userOperation: {
                    estimateFeesPerGas: async () => {
                        return (await pimlicoClient.getUserOperationGasPrice()).fast;
                    },
                },
            });
            console.log(`[SmartWallet] Sending userOp from ${safeAccount.address}...`);
            const txHash = await smartAccountClient.sendTransaction({
                to,
                value,
                data,
            });
            console.log(`[SmartWallet] Transaction sent: ${txHash}`);
            return txHash;
        }
        catch (error) {
            console.error("Error sending smart account transaction:", error);
            throw error;
        }
    }
    /**
     * Reconstructs the Smart Account Client for an owner key.
     * Used for signing messages (e.g. Polymarket Clob).
     */
    static async getSmartAccountClient(ownerPrivateKey) {
        const privateKey = ownerPrivateKey;
        const signer = privateKeyToAccount(privateKey);
        const safeAccount = await toSafeSmartAccount({
            client: publicClient,
            owners: [signer],
            version: "1.4.1",
            entryPoint: {
                address: entryPoint06Address,
                version: "0.6"
            },
        });
        const pimlicoBundler = createPimlicoClient({
            transport: http(TRANSPORT_URL),
            entryPoint: { address: entryPoint06Address, version: "0.6" },
        });
        const client = createSmartAccountClient({
            account: safeAccount,
            chain: polygon,
            bundlerTransport: http(TRANSPORT_URL),
            paymaster: pimlicoBundler,
            userOperation: {
                estimateFeesPerGas: async () => {
                    return (await pimlicoBundler.getUserOperationGasPrice()).fast;
                },
            },
        });
        // Attach original signer for direct signing if needed
        client.originalOwner = signer;
        return client;
    }
    /**
     * Fetches recent USDC transfers TO a specific address.
     * Uses viem public client to get logs.
     */
    static async getUSDCTransfers(toAddress, fromBlock) {
        try {
            const USDC_ADDRESS = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
            // Create a temporary client with Official Polygon RPC
            const scanningClient = createPublicClient({
                chain: polygon,
                transport: http("https://polygon-rpc.com"),
            });
            console.log(`[SmartWallet] Fetching USDC transfers to ${toAddress}...`);
            const currentBlock = await scanningClient.getBlockNumber();
            const lookback = 1000n; // ~40 minutes
            const from = fromBlock || (currentBlock - lookback);
            // Micro-chunking: 50 blocks per request to be extremely safe
            const chunkSize = 50n;
            const chunks = Number(lookback / chunkSize);
            const allLogs = [];
            console.log(`[SmartWallet] Scanning from ${from} to ${currentBlock} in ${chunks} chunks (Official RPC)...`);
            for (let i = 0; i < chunks; i++) {
                const chunkStart = from + (BigInt(i) * chunkSize);
                const chunkEnd = chunkStart + chunkSize;
                try {
                    const logs = await scanningClient.getLogs({
                        address: USDC_ADDRESS,
                        event: {
                            type: 'event',
                            name: 'Transfer',
                            inputs: [
                                { type: 'address', indexed: true, name: 'from' },
                                { type: 'address', indexed: true, name: 'to' },
                                { type: 'uint256', indexed: false, name: 'value' }
                            ]
                        },
                        args: {
                            to: toAddress
                        },
                        fromBlock: chunkStart,
                        toBlock: chunkEnd > currentBlock ? currentBlock : chunkEnd
                    });
                    allLogs.push(...logs);
                }
                catch (e) {
                    console.warn(`[SmartWallet] Failed to fetch chunk ${i}:`, e);
                }
            }
            return allLogs.map(log => ({
                txHash: log.transactionHash,
                blockNumber: log.blockNumber,
                amount: log.args.value,
                from: log.args.from
            }));
        }
        catch (error) {
            console.error("Error fetching USDC transfers:", error);
            return [];
        }
    }
}
//# sourceMappingURL=smartWallet.service.js.map