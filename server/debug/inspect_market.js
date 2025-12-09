import axios from "axios";

async function check() {
    try {
        const res = await axios.get("https://gamma-api.polymarket.com/events?limit=1");
        const event = res.data[0];
        console.log("Event Keys:", Object.keys(event));
        console.log("Event Tags:", event.tags);
        if (event.markets && event.markets.length > 0) {
            console.log("First Market Keys:", Object.keys(event.markets[0]));
            console.log("First Market Price:", event.markets[0].lastTradePrice || 0); // Check if price exists
        }
    } catch (e) {
        console.error(e);
    }
}

check();
