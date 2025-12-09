export declare class GeminiProvider {
    private client;
    private model;
    constructor(model?: string);
    generateResponse(systemPrompt: string, userPrompt: string): Promise<string | null>;
}
//# sourceMappingURL=gemini.d.ts.map