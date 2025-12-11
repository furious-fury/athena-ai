
// Standalone script to test Data API positions
// Usage: npx ts-node scripts/test-positions.ts

const PROXY_ADDRESS = "0x917EAEE23635ABD65E04F6Fc97Fa0adbFC14ca7B"; // From logs
const DATA_API_URL = "https://data-api.polymarket.com/positions";

async function main() {
    // Exact URL params requested by User
    const url = `${DATA_API_URL}?user=${PROXY_ADDRESS}&sizeThreshold=0.1&limit=100&sortBy=TOKENS&sortDirection=DESC`;
    console.log(`Fetching positions from: ${url}`);

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error("❌ HTTP Error:", res.status, res.statusText);
            return;
        }

        const data = await res.json();
        console.log("✅ Response received.");

        if (Array.isArray(data)) {
            console.log(`✅ Found ${data.length} positions.`);
            if (data.length > 0) {
                console.log("🔍 First Position Structure:");
                console.log(JSON.stringify(data[0], null, 2));
            } else {
                console.log("⚠️ No active positions found.");
            }
        } else {
            console.error("❌ Unexpected response format:", data);
        }

    } catch (e) {
        console.error("❌ Script error:", e);
    }
}

main();
