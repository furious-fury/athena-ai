import fetch from "node-fetch";
async function main() {
    try {
        console.log("Local Date.now():", Date.now());
        console.log("Local Date:", new Date().toString());
        const start = Date.now();
        const res = await fetch("https://clob.polymarket.com/time");
        const end = Date.now();
        const latency = (end - start) / 2;
        if (res.ok) {
            const json = await res.json();
            // Expected { "server_time": "..." } or similar
            console.log("Server Response:", json);
            // Check format. Sometimes it's iso string or timestamp
            // Documentation says GET /time returns { "server_time": "2021-..." } (ISO string)
            let serverTimeMs = 0;
            if (json.server_time) {
                serverTimeMs = new Date(json.server_time).getTime();
            }
            else if (json.timestamp) {
                serverTimeMs = json.timestamp * 1000;
            }
            if (serverTimeMs > 0) {
                const diff = serverTimeMs - (Date.now() + latency);
                console.log(`\nTime Difference (Server - Local): ${diff} ms`);
                console.log(`Difference in Minutes: ${diff / 60000}`);
                console.log(`Difference in Hours: ${diff / 3600000}`);
            }
        }
        else {
            console.error("Failed to fetch time:", res.status, res.statusText);
        }
    }
    catch (e) {
        console.error("Error:", e.message);
    }
}
main();
//# sourceMappingURL=check_time.js.map