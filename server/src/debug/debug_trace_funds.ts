
import "dotenv/config";
import { ethers } from "ethers";

const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const PROXY_ADDRESS = "0xA93a5464647Ea593F863061f676C21dA2E8Db953";
const NATIVE_USDC = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    // Check Nonce (Transaction Count)
    const nonce = await provider.getTransactionCount(PROXY_ADDRESS);
    console.log(`Transactions sent by Proxy: ${nonce}`);

    // Scan for Outgoing USDC Transfers from Proxy
    const iface = new ethers.utils.Interface(["event Transfer(address indexed from, address indexed to, uint256 value)"]);
    const usdc = new ethers.Contract(NATIVE_USDC, ["function balanceOf(address) view returns (uint256)"], provider);

    // Get current balance again to be absolutely sure
    const bal = await usdc.balanceOf(PROXY_ADDRESS);
    console.log(`Current Balance: ${ethers.utils.formatUnits(bal, 6)}`);

    // Only scan recent blocks if balance is 0
    if (bal.eq(0)) {
        console.log("Scanning for outgoing transfers (last 10000 blocks)...");
        const currentBlock = await provider.getBlockNumber();
        const filter = {
            address: NATIVE_USDC,
            fromBlock: currentBlock - 10000,
            toBlock: currentBlock,
            topics: [
                iface.getEventTopic("Transfer"),
                ethers.utils.hexZeroPad(PROXY_ADDRESS, 32) // topic1: from
            ]
        };

        try {
            const logs = await provider.getLogs(filter);
            if (logs.length > 0) {
                console.log(`Found ${logs.length} outgoing transfers!`);
                logs.forEach(log => {
                    const parsed = iface.parseLog(log);
                    console.log(`Sent ${ethers.utils.formatUnits(parsed.args.value, 6)} USDC to ${parsed.args.to} in TX ${log.transactionHash}`);
                });
            } else {
                console.log("No outgoing transfers found in recent blocks.");
            }
        } catch (e) {
            console.error("Log scan failed (RPC limit likely):", e);
        }
    }
}

main();
