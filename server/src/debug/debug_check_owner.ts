
import "dotenv/config";
import { ethers } from "ethers";

const RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const PROXY_ADDRESS = "0xA93a5464647Ea593F863061f676C21dA2E8Db953";
const EOA_ADDRESS = "0xAE5f490d08fd7Cce64F2B921df7CDE86420Cedb0";

async function main() {
    console.log(`Checking if ${EOA_ADDRESS} is owner of ${PROXY_ADDRESS}`);
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    // Gnosis Safe Check
    // Interface for isOwner(address)
    const safeAbi = ["function isOwner(address) view returns (bool)", "function getOwners() view returns (address[])"];
    const safe = new ethers.Contract(PROXY_ADDRESS, safeAbi, provider);

    try {
        const isOwner = await safe.isOwner(EOA_ADDRESS);
        console.log(`Is Owner: ${isOwner}`);

        const owners = await safe.getOwners();
        console.log(`All Owners: ${owners.join(", ")}`);

    } catch (e: any) {
        console.log("Failed to check owner (might not be a Gnosis Safe?):", e.message);

        // Check if it's just an EOA?
        const code = await provider.getCode(PROXY_ADDRESS);
        if (code === "0x") {
            console.log("Address has NO CODE. It is an EOA.");
        } else {
            console.log("Address HAS CODE. It is a Smart Contract.");
        }
    }
}

main();
