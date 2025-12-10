import { OpenAIProvider } from "./openai.js";
import { GeminiProvider } from "./gemini.js";
import { LLMProvider } from "@prisma/client";

export class LLMRouter {
    static getProvider(provider: LLMProvider | string, model?: string) {
        // Default to Gemini for free tier usage
        switch (provider) {
            case "OPENAI":
            case LLMProvider.OPENAI:
                return new OpenAIProvider(model);
            case "GEMINI":
            case LLMProvider.GEMINI:
                return new GeminiProvider(model);
            default:
                // Fallback to Gemini
                return new GeminiProvider(model);
        }
    }
}
