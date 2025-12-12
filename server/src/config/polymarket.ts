import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import { logger } from "./logger.js";
import { HttpsProxyAgent } from "https-proxy-agent";
import axios from "axios";

// Configure Proxy if available
const proxyUrl = process.env.POLY_PROXY_URL;
if (proxyUrl) {
    const agent = new HttpsProxyAgent(proxyUrl);
    // Patch Axios (used by ClobClient)
    axios.defaults.httpsAgent = agent;
    axios.defaults.proxy = false; // Disable axios's native proxy
    logger.info(`[PROXY] 🛡️ CLOB Client using Residential Proxy`);
}

// Initialize delegation wallet from private key
const delegationPrivateKey = process.env.DELEGATION_PRIVATE_KEY;
if (!delegationPrivateKey) {
    throw new Error("DELEGATION_PRIVATE_KEY not set in environment variables");
}

const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
const wallet = new ethers.Wallet(delegationPrivateKey, provider);

// Initialize CLOB client with L2 proxy wallet delegation
const clobClient = new ClobClient(
    process.env.POLYMARKET_CLOB_URL || "https://clob.polymarket.com",
    137, // Polygon chain ID
    wallet,
    {
        key: process.env.POLYMARKET_API_KEY || "",
        secret: process.env.POLYMARKET_API_SECRET || "",
        passphrase: process.env.POLYMARKET_PASSPHRASE || "",
    },
    2, // Safe proxy wallet type
    process.env.PROXY_WALLET_ADDRESS // User's proxy wallet address (will be overridden per-user)
);

logger.info("✅ Polymarket CLOB client initialized with L2 delegation");

export { clobClient, wallet };
