import "dotenv/config";
import { place_trade } from "./tools/polymarket.js";
import { prisma } from "./config/database.js";
async function main() {
    console.log("--- EOA Trade Placement Integration Test ---\n");
    const userId = "cmixw8l8j0000fgiyknopjqfe";
    const trade = {
        userId,
        marketId: "840727", // Known Working Market (Israel/Lebanon) which uses Native USDC
        outcome: "NO",
        side: "BUY",
        amount: 5, // 5 USDC Total
        price: 0.05 // Not used for limit calculation if we use MARKET kind of logic,
        // but here we likely place a LIMIT order.
        // 5 / 0.05 = 100 Shares? Value = $5.
    };
    // Override to ensure Min Size > $1 and correct direction
    // Outcome NO is priced at 0.001. Buying 200 shares at 0.02 = $4.00 Value
    trade.outcome = "NO";
    trade.price = 0.02;
    trade.amount = 100; // 200 SHARES * 0.02 = $4.00 USDC Value (Valid)
    console.log(`Test Parameters: Market=${trade.marketId}, Amount=${trade.amount}, Price=${trade.price}`);
    try {
        console.log(`Placing Trade...`);
        const result = await place_trade(trade);
        console.log("Trade Result:", result);
        console.log("\n✅ SUCCESS: Trade Placed Successfully on Native USDC Market!");
    }
    catch (e) {
        console.error("Trade Failed:", e.message);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=debug_trade_eoa.js.map