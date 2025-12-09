
import "dotenv/config";
import fetch from "node-fetch";

async function main() {
    console.log("--- Debugging Tick Size ---");
    // Token ID from the log failure
    const tokenID = "87769991026114894163580777793845523168226980076553814689875238288185044414090";

    const url = `https://clob.polymarket.com/tick-size?token_id=${tokenID}`;
    console.log(`Fetching: ${url}`);

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`FAILED: ${res.status} ${res.statusText}`);
            console.error(await res.text());
        } else {
            const data = await res.json();
            console.log("SUCCESS:", data);
        }
    } catch (e: any) {
        console.error("Exception:", e.message);
    }
}

main();
