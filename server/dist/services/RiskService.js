import { Portfolio } from "../models/Portfolio.js";
export const RiskService = {
    async getTotalExposure(userId) {
        const positions = await Portfolio.getAllUserPositions(userId);
        const totalExposure = positions.reduce((acc, pos) => acc + (pos.quantity * (pos.avgPrice ?? 0)), 0);
        return totalExposure;
    }
};
//# sourceMappingURL=RiskService.js.map