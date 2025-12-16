import { OpenAIProvider } from "./openai.js";
import { GeminiProvider } from "./gemini.js";
import { LLMProvider } from "@prisma/client";
import { ClaudeProvider } from "./claude.js";

export class LLMRouter {
    static getProvider(provider: LLMProvider | string, model?: string) {
        // Default to OPENAI for free tier usage
        switch (provider) {
            case "OPENAI":
            case LLMProvider.OPENAI:
                return new OpenAIProvider(model);
            case "GEMINI":
            case LLMProvider.GEMINI:
                return new GeminiProvider(model);
            case "ANTHROPIC":
            case LLMProvider.ANTHROPIC:
                return new ClaudeProvider(model);
            default:
                // Fallback to OpenAI
                return new OpenAIProvider(model);
        }
    }
}
