-- AlterEnum
ALTER TYPE "LLMProvider" ADD VALUE 'GEMINI';

-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "pollingInterval" SET DEFAULT 300;

-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "marketTitle" TEXT;

-- CreateTable
CREATE TABLE "PortfolioSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "cashBalance" DOUBLE PRECISION NOT NULL,
    "positionsValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PortfolioSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortfolioSnapshot_userId_timestamp_idx" ON "PortfolioSnapshot"("userId", "timestamp");

-- AddForeignKey
ALTER TABLE "PortfolioSnapshot" ADD CONSTRAINT "PortfolioSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
