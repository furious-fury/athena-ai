# Athena AI - Agentic Trading Platform

Athena AI is an autonomous agentic trading platform that leverages AI agents to execute trades, analyze markets, and manage risk on the Polymarket (and other) platforms.

## 📂 Project Structure

The project is divided into two main parts:

- **[Client](./client/README.md)**: The frontend user interface built with React, Vite, and TailwindCSS. It provides a dashboard for users to monitor agents, view portfolio stats, and manage their settings.
- **[Server](./server/README.md)**: The backend API built with Node.js, Express, and TypeScript. It handles the core logic for trading agents, database interactions (Prisma/PostgreSQL), background jobs (BullMQ), and executing trades on-chain or via APIs.

## 🚀 Quick Start

To run the entire application, you will need to start both the server and the client.

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Redis (for background queues)

### 1. Setup Server

Navigate to the `server` directory and follow the [Server README](./server/README.md) to configure your environment variables and database.

```bash
cd server
npm install
# Set up .env files as per documentation
npx prisma migrate dev
npm run dev
```

### 2. Setup Client

Navigate to the `client` directory and follow the [Client README](./client/README.md).

```bash
cd client
npm install
npm run dev
```

## 🛠️ Features

- **Autonomous Agents**: Deploy and control AI agents that trade based on configurable strategies.
- **Real-time Monitoring**: Watch agent activities, trade logs, and performance metrics in real-time.
- **Risk Management**: Automated risk checks and portfolio exposure analysis.
- **Actionable Insights**: Market exploration and data visualization.

## 📚 Documentation

Detailed documentation for each part of the stack can be found in their respective directories:

- [Client Documentation](./client/README.md)
- [Server Documentation](./server/README.md)
