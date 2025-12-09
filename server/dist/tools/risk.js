import { prisma } from "../config/database.js";
import { Portfolio } from "../models/Portfolio.js";
export async function check_risk({ userId }) {
    // 1️⃣ Get current exposure
    const positions = await Portfolio.getAllUserPositions(userId);
    const totalExposure = positions.reduce((acc, pos) => acc + (pos.shares * (pos.avgEntryPrice ?? 0)), 0);
    // 2️⃣ Get user balance
    const user = await prisma.user.findUnique({ where: { walletAddress: userId } });
    const balance = user?.balance ?? 0;
    // 3️⃣ Check max allowed exposure (e.g., 35% of balance)
    const maxExposure = 0.35;
    if (balance > 0 && totalExposure / balance > maxExposure) {
        return { allowed: false, reason: "Exposure exceeds 35% of your balance" };
    }
    return { allowed: true };
}
//# sourceMappingURL=risk.js.map