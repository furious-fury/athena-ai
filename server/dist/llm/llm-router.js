import { OpenAIProvider } from "./openai.js";
import { GeminiProvider } from "./gemini.js";
import { LLMProvider } from "@prisma/client";
export class LLMRouter {
    static getProvider(provider, model) {
        // Default to Gemini for free tier usage
        switch (provider) {
            case "OPENAI":
            case LLMProvider.OPENAI:
                // User is out of OpenAI credits, redirecting to Gemini
                return new GeminiProvider("gemini-2.5-flash");
            case "GEMINI":
            case LLMProvider.GEMINI:
                return new GeminiProvider(model || "gemini-2.5-flash");
            default:
                // Fallback to Gemini now
                return new GeminiProvider(model || "gemini-2.5-flash");
        }
    }
}
//# sourceMappingURL=llm-router.js.map