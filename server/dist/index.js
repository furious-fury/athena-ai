import { AgentWorker } from "./workers/AgentWorker.js";
async function main() {
    // Start one agent worker (you can start multiple)
    const worker = new AgentWorker("agent_123");
    await worker.start();
}
main().catch((err) => console.error("❌ Server failed to start", err));
//# sourceMappingURL=index.js.map