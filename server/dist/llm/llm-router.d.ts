import { OpenAIProvider } from "./openai.js";
import { GeminiProvider } from "./gemini.js";
import { LLMProvider } from "@prisma/client";
export declare class LLMRouter {
    static getProvider(provider: LLMProvider | string, model?: string): OpenAIProvider | GeminiProvider;
}
//# sourceMappingURL=llm-router.d.ts.map