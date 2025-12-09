import { GoogleGenAI } from "@google/genai";
import { logger } from "../config/logger.js";
const GENAI_API_KEY = process.env.GOOGLE_API_KEY;
export class GeminiProvider {
    constructor(model = "gemini-2.5-flash") {
        if (!GENAI_API_KEY) {
            throw new Error("GOOGLE_API_KEY is missing in environment variables.");
        }
        this.client = new GoogleGenAI({ apiKey: GENAI_API_KEY });
        this.model = model;
    }
    async generateResponse(systemPrompt, userPrompt) {
        try {
            const response = await this.client.models.generateContent({
                model: this.model,
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: systemPrompt },
                            { text: userPrompt }
                        ]
                    }
                ],
                config: {
                    responseMimeType: "application/json",
                }
            });
            return response.text || null;
        }
        catch (err) {
            logger.error({ err }, "Gemini API Error");
            return null;
        }
    }
}
//# sourceMappingURL=gemini.js.map