import { AgentWorker } from "./AgentWorker.js";

/**
 * Scheduler to manage multiple agent workers
 */
export class AgentScheduler {
    private workers: Map<string, AgentWorker> = new Map();

    /**
     * Start a worker for a given agent
     */
    startAgent(agentId: string) {
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
    stopAgent(agentId: string) {
        const worker = this.workers.get(agentId);
        if (!worker) return;
        worker.stop();
        this.workers.delete(agentId);
    }

    /**
     * Start multiple agents
     */
    startAgents(agentIds: string[]) {
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
