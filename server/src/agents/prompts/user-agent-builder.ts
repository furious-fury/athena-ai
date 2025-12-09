import { AgentRegistry, type AgentMetadata } from "../AgentRegistry.js";
import { BaseAgentPrompt } from "./base.prompt.js";

interface UserAgentOptions {
    userId: string;
    name: string;
    description: string;
    basePrompt: BaseAgentPrompt;
}

export class UserAgentBuilder {
    static buildAgent({ userId, name, description, basePrompt }: UserAgentOptions) {
        const agentId = `${userId}_${name}`;
        const promptText = basePrompt.modifyPrompt(`Agent for user ${userId}`);

        const metadata: Omit<AgentMetadata, "createdAt" | "updatedAt"> = {
            id: agentId,
            name,
            description,
            prompt: promptText,
        };

        AgentRegistry.register(metadata);
        return metadata;
    }
}
