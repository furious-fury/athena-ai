
import "dotenv/config";
import { ethers } from "ethers";

const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const TX_HASH = "0xa3ba98c0cb5ec71509e7445a4faba4b6f07f39a7d9224cb049f245685d9e7b6e";

async function main() {
    console.log(`Analyzing TX: ${TX_HASH}`);
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

        const tx = await provider.getTransaction(TX_HASH);
        if (!tx) {
            console.log("❌ TX not found on this RPC.");
            return;
        }

        console.log(`From: ${tx.from}`);
        console.log(`To (Contract/Recipient): ${tx.to}`);
        console.log(`Value (Native): ${ethers.utils.formatEther(tx.value)} POL`);

        const receipt = await provider.getTransactionReceipt(TX_HASH);
        console.log(`Status: ${receipt.status === 1 ? "✅ Success" : "❌ Failed"}`);

        // Analyze Logs for Token Transfers
        const erc20Interface = new ethers.utils.Interface([
            "event Transfer(address indexed from, address indexed to, uint256 value)"
        ]);

        console.log("\n--- Token Transfers ---");
        let found = false;
        receipt.logs.forEach((log) => {
            try {
                const parsed = erc20Interface.parseLog(log);
                console.log(`Contract: ${log.address}`);
                console.log(`  Source: ${parsed.args.from}`);
                console.log(`  Destin: ${parsed.args.to}`);

                // Identify Token
                let tokenName = "Unknown";
                if (log.address.toLowerCase() === "0x2791bca1f2de4661ed88a30c99a7a9449aa84174") tokenName = "USDC (Bridged)";
                if (log.address.toLowerCase() === "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359") tokenName = "USDC (Native)";

                // Native USDC has 6 decimals, Bridged has 6
                console.log(`  Amount: ${ethers.utils.formatUnits(parsed.args.value, 6)} ${tokenName}`);
                found = true;
            } catch (e) {
                // Not a transfer event
            }
        });

        if (!found && tx.value.gt(0)) {
            console.log(`Native POL Transfer of ${ethers.utils.formatEther(tx.value)} POL to ${tx.to}`);
        } else if (!found) {
            console.log("No token transfers or native value transfer detected.");
        }

    } catch (error) {
        console.error("Error analyzing TX:", error);
    }
}

main();
