
import "dotenv/config";
import { PrismaClient, LLMProvider } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

// We need to match the project's expectation for the adapter
// If database.ts uses `new PrismaPg({ connectionString })`, we follow it.
// However, standard usage is new PrismaPg(pool). 
// Let's assume database.ts might have been using a helper or I misread it. 
// Given the error, I'll try the standard Pool approach which usually works with the adapter.
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const AGENT_ID = "cmj0o2qnk00032ciylwcqt24z";

async function main() {
    console.log(`Updating Agent ${AGENT_ID} to use OpenAI gpt-5-nano...`);

    try {
        const updated = await prisma.agent.update({
            where: { id: AGENT_ID },
            data: {
                llmProvider: "OPENAI" as LLMProvider,
                llmModel: "gpt-5-nano"
            }
        });

        console.log("✅ Agent updated successfully:", updated);
    } catch (e) {
        console.error("❌ Update failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
