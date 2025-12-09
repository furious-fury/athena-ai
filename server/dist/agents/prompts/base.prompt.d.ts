export interface BasePrompt {
    id: string;
    name: string;
    description: string;
    promptText: string;
}
export declare abstract class BaseAgentPrompt implements BasePrompt {
    id: string;
    name: string;
    description: string;
    promptText: string;
    constructor({ id, name, description, promptText }: BasePrompt);
    abstract modifyPrompt(input: string): string;
}
//# sourceMappingURL=base.prompt.d.ts.map