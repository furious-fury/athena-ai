
import "dotenv/config";
import { PrismaClient, LLMProvider } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🔄 Backfilling existing agents to gpt-5-nano...");

    // Update all agents that don't have a model set (or aren't nano)
    const result = await prisma.agent.updateMany({
        where: {}, // Update ALL agents to ensure consistency as requested
        data: {
            llmProvider: "OPENAI" as LLMProvider,
            llmModel: "gpt-5-nano"
        }
    });

    console.log(`✅ Updated ${result.count} agents.`);
    await prisma.$disconnect();
}

main();
