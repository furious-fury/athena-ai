import { Portfolio } from "../models/Portfolio.js";

export const RiskService = {
    async getTotalExposure(userId: string) {
        const positions = await Portfolio.getAllUserPositions(userId);
        const totalExposure = positions.reduce((acc: number, pos: any) => acc + (pos.quantity * (pos.avgPrice ?? 0)), 0);
        return totalExposure;
    }
};
