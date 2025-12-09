import { type AgentMetadata } from "../AgentRegistry.js";
import { BaseAgentPrompt } from "./base.prompt.js";
interface UserAgentOptions {
    userId: string;
    name: string;
    description: string;
    basePrompt: BaseAgentPrompt;
}
export declare class UserAgentBuilder {
    static buildAgent({ userId, name, description, basePrompt }: UserAgentOptions): Omit<AgentMetadata, "createdAt" | "updatedAt">;
}
export {};
//# sourceMappingURL=user-agent-builder.d.ts.map