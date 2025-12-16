import Anthropic from '@anthropic-ai/sdk';
import { logger } from "../config/logger.js";

export class ClaudeProvider {
    private client: Anthropic;
    private model: string;

    constructor(model = "claude-haiku-3-5-20240620") {
        this.client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.model = model;
    }

    async generateResponse(systemPrompt: string, userPrompt: string): Promise<string | null> {
        try {
            const message = await this.client.messages.create({
                model: this.model,
                max_tokens: 4096,
                system: systemPrompt,
                messages: [
                    { role: "user", content: userPrompt }
                ],
            });

            // Extract text content
            // Extract text content
            const contentBlock = message.content[0];
            if (contentBlock && contentBlock.type === 'text') {
                return contentBlock.text;
            }

            return null;
        } catch (err: unknown) {
            logger.error({ err }, "Anthropic API Error");
            return null;
        }
    }
}
