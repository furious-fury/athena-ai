# Poly-Dapp Server

The backend service for the Poly-Dapp Agentic Trading platform. This server manages trading agents, risk analysis, portfolio tracking, and handles the job queue for executing trades.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Queue/Caching**: Redis (BullMQ / Custom implementation)
- **Logging**: Pino

## 📋 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

## 🚀 Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `server` directory. You can copy the structure below:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://user:password@localhost:5432/polydapp"
   REDIS_HOST="127.0.0.1"
   REDIS_PORT=6379
   REDIS_PASSWORD=""
   ```

3. **Database Setup**
   Run the Prisma migrations to set up your database schema:
   ```bash
   npx prisma migrate dev
   ```

## 🏃‍♂️ Running the Server

**Development Mode** (with hot-reload):
```bash
npm run dev
```

**Production Start**:
```bash
npm start
```

## 📡 API Documentation

### Trade Management
- **Execute Agent Trade**
  - `POST /api/trade/agent`
  - Body: `{ "agentId": "...", "marketId": "...", "amount": 100, "side": "BUY", "outcome": "YES" }`

### Portfolio & Risk
- **Get User Portfolio**
  - `GET /api/portfolio/:userId`
  - Returns user positions and their current status.

- **Get Risk Exposure**
  - `GET /api/risk/exposure/:userId`
  - Returns total calculated risk exposure for a specific user.

### Queue Management
- **Get Queue Status**
  - `GET /api/queue/status`
  - Returns metrics: `queueLength`, `delayedLength`, `retries`, `activeWorkers`.

- **Get Pending Jobs**
  - `GET /api/queue/jobs`
  - Lists currently queued and delayed jobs.

## 🏗️ Architecture Overview

- **Server Entry**: `src/server.ts` initializes Redis, Agent Workers, and the Express App.
- **Agents**: Logic for trading agents is encapsulated in `src/agents`.
- **Workers**: `AgentWorker` runs in the background to process trade jobs from the queue.
- **Services**: Business logic is separated into services (`TradeService`, `RiskService`, `PortfolioService`).
