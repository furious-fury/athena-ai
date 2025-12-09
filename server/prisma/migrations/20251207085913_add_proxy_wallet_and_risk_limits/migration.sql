/*
  Warnings:

  - A unique constraint covering the columns `[proxyWallet]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "maxMarketExposure" DOUBLE PRECISION NOT NULL DEFAULT 500,
ADD COLUMN     "maxTotalExposure" DOUBLE PRECISION NOT NULL DEFAULT 2000,
ADD COLUMN     "maxTradeAmount" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "proxyWallet" TEXT,
ADD COLUMN     "proxyWalletDelegated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tradeCooldownSeconds" INTEGER NOT NULL DEFAULT 300;

-- CreateIndex
CREATE UNIQUE INDEX "User_proxyWallet_key" ON "User"("proxyWallet");
