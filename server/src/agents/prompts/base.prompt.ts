export interface BasePrompt {
    id: string;
    name: string;
    description: string;
    promptText: string;
}

export abstract class BaseAgentPrompt implements BasePrompt {
    id: string;
    name: string;
    description: string;
    promptText: string;

    constructor({ id, name, description, promptText }: BasePrompt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.promptText = promptText;
    }

    abstract modifyPrompt(input: string): string;
}
