
import type { Request, Response } from "express";
import { prisma } from "../config/database.js";

export const ActivityController = {
    // Log a new activity (Internal use or Manual from Frontend for Deposits)
    async logActivity(req: Request, res: Response) {
        try {
            const { userId, type, amount, txId } = req.body;

            if (!userId || !type || !amount) {
                res.status(400).json({ error: "Missing required fields" });
                return;
            }

            const activity = await prisma.activity.create({
                data: {
                    userId,
                    type, // "DEPOSIT" | "WITHDRAWAL"
                    amount: Number(amount),
                    txId: txId || null
                }
            });

            res.json({ success: true, activity });
        } catch (error) {
            console.error("Failed to log activity:", error);
            res.status(500).json({ error: "Failed to log activity" });
        }
    },

    // Fetch user activity
    async getUserActivity(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const limit = Number(req.query.limit) || 20;

            if (!userId) {
                res.status(400).json({ error: "UserId is required" });
                return;
            }

            const activities = await prisma.activity.findMany({
                where: { userId },
                orderBy: { timestamp: "desc" },
                take: limit
            });

            res.json({ success: true, activities });
        } catch (error) {
            console.error("Failed to fetch activity:", error);
            res.status(500).json({ error: "Failed to fetch activity" });
        }
    }
};
