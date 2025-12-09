import { Router } from "express";
import { RiskService } from "../services/RiskService.js";
export const riskRouter = Router();
// GET /api/risk/exposure/:userId
riskRouter.get("/exposure/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const totalExposure = await RiskService.getTotalExposure(userId);
        res.json({ success: true, totalExposure });
    }
    catch (err) {
        console.error("Risk error:", err);
        res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
    }
});
//# sourceMappingURL=risk.routes.js.map