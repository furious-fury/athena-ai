import { Router } from "express";
import { prisma } from "../config/database.js";

export const authRouter = Router();

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            res.status(400).json({ success: false, message: "Wallet address is required" });
            return;
        }

        // Upsert: Create if not exists, otherwise return existing
        const user = await prisma.user.upsert({
            where: { walletAddress: walletAddress },
            update: {}, // No updates needed on login for now
            create: {
                walletAddress: walletAddress,
                userName: walletAddress, // Default username
            }
        });

        // Check if user has agents
        const agentCount = await prisma.agent.count({
            where: { userId: user.id }
        });

        if (agentCount === 0) {
            console.log(`[Auth] Seeding default agents for ${user.id}...`);
            const { generateSystemPrompt } = await import("../agents/prompts.js");

            const defaults = [
                { name: "Conservative Agent", risk: "LOW" as const },
                { name: "Balanced Agent", risk: "MEDIUM" as const },
                { name: "Aggressive Agent", risk: "HIGH" as const }
            ];

            for (const def of defaults) {
                await prisma.agent.create({
                    data: {
                        userId: user.id,
                        name: def.name,
                        description: "Athena Created",
                        riskProfile: def.risk,
                        systemPrompt: generateSystemPrompt(def.name, "Athena Created", def.risk),
                        isActive: false
                    }
                });
            }
        }

        res.json({ success: true, user });
    } catch (err) {
        console.error("Auth error:", err);
        res.status(500).json({ success: false, message: "Failed to authenticate user" });
    }
});
