import 'dotenv/config';
import { prisma } from '../config/database.js';

async function main() {
    const totalTrades = await prisma.trade.count();
    console.log(`Total Trades: ${totalTrades}`);

    const byStatus = await prisma.trade.groupBy({
        by: ['status'],
        _count: {
            status: true
        }
    });

    console.log('Trades by Status:', byStatus);

    // Show 5 most recent trades regardless of status
    const recent = await prisma.trade.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true, side: true, outcome: true, amount: true }
    });
    console.log('Recent 5 Trades:', recent);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
