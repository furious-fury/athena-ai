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

### Core Trading Capabilities
- **Autonomous Agents**: Deploy and control AI agents that trade based on news-driven strategies and configurable risk profiles.
- **Real-time Monitoring**: Watch agent activities, trade logs, and performance metrics in real-time.
- **Risk Management**: Automated risk checks, portfolio exposure analysis, and trade cooldown enforcement.
- **Actionable Insights**: Market exploration and data visualization.

### Intelligence Layer
- **News-Driven Trading**: Agents analyze real-time news from 14 curated sources to identify market-moving events.
- **Multi-Source Data Aggregation**:
  - **Crypto (5 sources)**: CoinDesk, CoinTelegraph, Decrypt, The Block, Bitcoin Magazine
  - **Tech (4 sources)**: TechCrunch, Wired, The Verge, Ars Technica
  - **Finance (3 sources)**: CNBC International, BBC World, Al Jazeera
  - **Politics (3 sources)**: Politico, Politico EU, NYT Politics
  - **Market Data**: Live CoinGecko API integration for trending cryptocurrencies
- **AI Signal Processing**: LLM-powered analysis (OpenAI/Gemini) extracts high-confidence trading signals with reasoning.
- **Smart Market Matching**: Automatically searches Polymarket for relevant prediction markets based on detected signals.

### Enhanced Activity Logging
- **Detailed Event Tracking**: Logs capture data fetching, risk assessments, and decision-making processes.
- **Visual Log Types**: Distinct UI indicators for different event types (📡 Data Fetch, 🛡️ Risk Assessment, 📝 Decisions).
- **AI Reasoning Display**: Collapsible sections show the AI's thought process behind each trade decision.

### Security & Privacy
- **End-to-End Encryption**: User private keys encrypted at rest using AES-256-GCM with HKDF key derivation.
- **Per-User Key Isolation**: Each user's data is cryptographically isolated with unique derived keys.
- **Secure Key Management**: Master encryption key stored in environment variables, never exposed to clients.

## 📚 Documentation

Detailed documentation for each part of the stack can be found in their respective directories:

- [Client Documentation](./client/README.md)
- [Server Documentation](./server/README.md)

