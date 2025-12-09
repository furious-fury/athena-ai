
import "dotenv/config";
import fetch from "node-fetch";

const GAMMA_API = "https://gamma-api.polymarket.com/markets";

async function main() {
    console.log("--- Checking Market Collateral Tokens ---");

    const markets = [
        "570362", // Failed (Automated)
        "840727"  // Succeeded (Debug EOA)
    ];

    for (const id of markets) {
        try {
            console.log(`\nFetching Market ${id}...`);
            const res = await fetch(`${GAMMA_API}/${id}`);
            if (!res.ok) {
                console.error(`Error fetching ${id}: ${res.statusText}`);
                continue;
            }
            const data: any = await res.json();

            // Log FULL Structure for debugging (only first one to save space if needed, but here both are useful)
            console.log(`FULL JSON for ${id}:`, JSON.stringify(data, null, 2));

        } catch (e: any) {
            console.error("Error:", e.message);
        }
    }
}

main();
