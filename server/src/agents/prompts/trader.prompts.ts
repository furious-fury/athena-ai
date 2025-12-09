// src/agents/prompts/trader.prompt.ts
import { BaseAgentPrompt } from "./base.prompt.js";

export class TraderPrompt extends BaseAgentPrompt {
    modifyPrompt(input: string): string {
        // Could append user-specific instructions, market conditions, etc.
        return `${this.promptText} | ${input}`;
    }
}
