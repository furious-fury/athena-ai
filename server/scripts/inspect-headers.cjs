
const { ClobClient } = require("@polymarket/clob-client");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("Inspecting Headers Logic...");

    try {
        const headersModule = require("@polymarket/clob-client/dist/headers");
        console.log("injectBuilderHeaders Source:\n", headersModule.injectBuilderHeaders.toString());

        console.log("\n--- SEARCHING client.js for deriveApiKey ---");
        const clientJsPath = path.resolve("c:/Users/Mr Fury/Desktop/all-codes/poly-dapp/client/node_modules/@polymarket/clob-client/dist/client.js");

        try {
            const content = fs.readFileSync(clientJsPath, 'utf8');

            // Search for POLY constants
            const PolyMatch = content.match(/POLY_[A-Z_]+/g);
            console.log("POLY_ constants found in client.js:", [...new Set(PolyMatch)]);

            // Search for deriveApiKey function definition
            // It might follow pattern: deriveApiKey(nonce, timestamp)
            const match = content.match(/deriveApiKey\s*=\s*function\s*\((.*?)\)\s*\{/);

            if (match) {
                console.log("Found deriveApiKey definition. Args:", match[1]);
                const start = match.index;
                const extraction = content.substring(start, start + 800);
                console.log("Source Snippet:\n", extraction);
            } else {
                // Try to find just the assignment if it's minified strangely
                const idx = content.indexOf("deriveApiKey =");
                if (idx !== -1) {
                    console.log("Found 'deriveApiKey =' at index:", idx);
                    console.log("Snippet:\n", content.substring(idx, idx + 800));
                } else {
                    console.log("Could not locate deriveApiKey definition");
                }
            }

        } catch (err) {
            console.log("Reading client.js failed:", err.message);
        }

    } catch (e) {
        console.error(e);
    }
}

main();
