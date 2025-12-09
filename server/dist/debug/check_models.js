import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is missing in environment variables.");
}
const ai = new GoogleGenAI({ apiKey });
async function main() {
    try {
        const response = await ai.models.list();
        console.log("Available Models:");
        for await (const model of response) {
            console.log(`- ${model.name}`);
        }
    }
    catch (error) {
        console.error("Error listing models:", error);
    }
}
main();
//# sourceMappingURL=check_models.js.map