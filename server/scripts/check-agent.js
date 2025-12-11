import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Add Pool to global scope to prevent "Client has already been connected" errors during restarts
// similar to how we handle PrismaClient
const globalForPg = global;
const pool = globalForPg.pgPool || new pg.Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🔍 Connecting to database...");

    // Check for the specific failing agent ID
    const targetId = 'cmj0wvx3z0000c0iy4kpt03hb';
    console.log(`Checking for specific agent ID: ${targetId}`);

    const specificAgent = await prisma.agent.findUnique({ where: { id: targetId } });
    if (specificAgent) {
        console.log(`✅ Target Agent FOUND: ${specificAgent.name} (Active: ${specificAgent.isActive})`);
    } else {
        console.log(`❌ Target Agent NOT FOUND`);
    }

    // List all agents
    console.log('\n--- Full Agent List ---');
    const allAgents = await prisma.agent.findMany();

    if (allAgents.length === 0) {
        console.log("⚠️ No agents exist in the database.");
    } else {
        allAgents.forEach(a => {
            console.log(`ID: ${a.id} | Name: ${a.name} | Active: ${a.isActive} | User: ${a.userId}`);
        });
    }
}

main()
    .catch(e => {
        console.error("Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
