export declare class OpenAIProvider {
    private client;
    private model;
    constructor(model?: string);
    generateResponse(systemPrompt: string, userPrompt: string): Promise<string | null>;
}
//# sourceMappingURL=openai.d.ts.map