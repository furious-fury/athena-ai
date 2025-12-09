import OpenAI from "openai";
import { logger } from "../config/logger.js";
export class OpenAIProvider {
    constructor(model = "gpt-4o-mini") {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.model = model;
    }
    async generateResponse(systemPrompt, userPrompt) {
        try {
            const completion = await this.client.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                model: this.model,
                response_format: { type: "json_object" }, // Enforce JSON for agent decisions
            });
            return completion.choices[0]?.message?.content || null;
        }
        catch (err) {
            logger.error({ err }, "OpenAI API Error");
            return null;
        }
    }
}
//# sourceMappingURL=openai.js.map