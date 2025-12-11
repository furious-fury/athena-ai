import { prisma } from "../config/database.js";

async function updatePollingInterval() {
    try {
        // Update all active agents to 120 seconds polling interval
        const result = await prisma.agent.updateMany({
            where: {
                isActive: true
            },
            data: {
                pollingInterval: 120
            }
        });

        console.log(`✅ Updated ${result.count} agent(s) to 120-second polling interval`);

        // Show updated agents
        const agents = await prisma.agent.findMany({
            where: { isActive: true },
            select: { id: true, name: true, pollingInterval: true }
        });

        console.log("\nActive Agents:");
        agents.forEach(agent => {
            console.log(`  - ${agent.name}: ${agent.pollingInterval}s`);
        });

    } catch (error) {
        console.error("Failed to update polling interval:", error);
    } finally {
        await prisma.$disconnect();
    }
}

updatePollingInterval();
