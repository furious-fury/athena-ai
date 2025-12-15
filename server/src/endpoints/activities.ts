import express from "express";

const router = express.Router();

// Placeholder for activities
router.get("/", (req, res) => {
    res.json([]);
});

export const activitiesRouter = router;
