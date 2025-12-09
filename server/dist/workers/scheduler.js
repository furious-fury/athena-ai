import { AgentWorker } from "./AgentWorker.js";
/**
 * Scheduler to manage multiple agent workers
 */
export class AgentScheduler {
    constructor() {
        this.workers = new Map();
    }
    /**
     * Start a worker for a given agent
     */
    startAgent(agentId) {
        if (this.workers.has(agentId)) {
            console.log(`⚠ Worker already running for ${agentId}`);
            return;
        }
        const worker = new AgentWorker(agentId);
        this.workers.set(agentId, worker);
        worker.start();
    }
    /**
     * Stop a worker for a given agent
     */
    stopAgent(agentId) {
        const worker = this.workers.get(agentId);
        if (!worker)
            return;
        worker.stop();
        this.workers.delete(agentId);
    }
    /**
     * Start multiple agents
     */
    startAgents(agentIds) {
        for (const id of agentIds) {
            this.startAgent(id);
        }
    }
    /**
     * Stop all agents
     */
    stopAll() {
        for (const worker of this.workers.values()) {
            worker.stop();
        }
        this.workers.clear();
    }
    /**
     * List active agents
     */
    getActiveAgents() {
        return Array.from(this.workers.keys());
    }
}
//# sourceMappingURL=scheduler.js.map