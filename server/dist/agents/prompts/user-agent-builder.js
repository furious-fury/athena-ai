import { AgentRegistry } from "../AgentRegistry.js";
import { BaseAgentPrompt } from "./base.prompt.js";
export class UserAgentBuilder {
    static buildAgent({ userId, name, description, basePrompt }) {
        const agentId = `${userId}_${name}`;
        const promptText = basePrompt.modifyPrompt(`Agent for user ${userId}`);
        const metadata = {
            id: agentId,
            name,
            description,
            prompt: promptText,
        };
        AgentRegistry.register(metadata);
        return metadata;
    }
}
//# sourceMappingURL=user-agent-builder.js.map