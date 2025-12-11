
// Script to inspect raw trade data structure
const PROXY_ADDRESS = "0x917EAEE23635ABD65E04F6Fc97Fa0adbFC14ca7B";
const DATA_API_URL = "https://data-api.polymarket.com/trades";

async function main() {
    const url = `${DATA_API_URL}?user=${PROXY_ADDRESS}&limit=5&takerOnly=false`;
    console.log(`Fetching trades from: ${url}`);

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error("❌ HTTP Error:", res.status);
            return;
        }

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            console.log("🔍 First Trade Structure:");
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            console.log("⚠️ No trades found or unexpected format.");
        }
    } catch (e) {
        console.error("❌ Script error:", e);
    }
}

main();
