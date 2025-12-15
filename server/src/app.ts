import cors from "cors";
import express from "express";
import bodyParser from "body-parser";

//routes
import { portfolioRouter } from "./routes/portfolio.routes.js";
import { agentRouter } from "./routes/agent.routes.js";
import { tradeRouter } from "./routes/trade.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { activitiesRouter } from "./endpoints/activities.js";
import { statsRouter } from "./endpoints/stats.js";
import userRouter from "./routes/user.routes.js";
import { riskRouter } from "./routes/risk.routes.js";
import { queueRouter } from "./routes/queue.routes.js";
import { marketRouter } from "./routes/market.routes.js";
import { logRouter } from "./routes/log.routes.js";

export const app = express();

// Middleware
app.use(express.json());    // Parse JSON request bodies
app.use(cors());
app.use(bodyParser.json());

// Simple health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.get("/", (req, res) => {
    res.send("✅ Server is running");
});


// API routes
app.use("/api/trade", tradeRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/risk", riskRouter);
app.use("/api/queue", queueRouter);
app.use("/api/activities", activitiesRouter);
app.use("/api/stats", statsRouter);
app.use("/api/markets", marketRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/logs", logRouter);
