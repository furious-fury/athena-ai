
import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🔍 Checking all agents...");
    const agents = await prisma.agent.findMany();

    console.table(agents.map(a => ({
        id: a.id,
        name: a.name,
        provider: a.llmProvider,
        model: a.llmModel
    })));

    await prisma.$disconnect();
}

main();
