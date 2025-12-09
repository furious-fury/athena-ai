/*
  Warnings:

  - You are about to drop the column `agentId` on the `Position` table. All the data in the column will be lost.
  - You are about to drop the column `avgPrice` on the `Position` table. All the data in the column will be lost.
  - You are about to drop the column `pnl` on the `Position` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Position` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Position` table. All the data in the column will be lost.
  - You are about to drop the column `pnl` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `txHash` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `proxyWallet` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `proxyWalletDelegated` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `MarketCache` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[proxyAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `outcome` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `side` on the `Trade` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "User_proxyWallet_key";

-- AlterTable
ALTER TABLE "Position" DROP COLUMN "agentId",
DROP COLUMN "avgPrice",
DROP COLUMN "pnl",
DROP COLUMN "quantity",
DROP COLUMN "updatedAt",
ADD COLUMN     "avgEntryPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "outcome" TEXT NOT NULL,
ADD COLUMN     "shares" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "exposure" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "pnl",
DROP COLUMN "txHash",
ALTER COLUMN "txId" DROP NOT NULL,
DROP COLUMN "side",
ADD COLUMN     "side" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "proxyWallet",
DROP COLUMN "proxyWalletDelegated",
ADD COLUMN     "apiKey" TEXT,
ADD COLUMN     "apiPassphrase" TEXT,
ADD COLUMN     "apiSecret" TEXT,
ADD COLUMN     "proxyAddress" TEXT,
ADD COLUMN     "proxyBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "proxyPrivateKey" TEXT;

-- DropTable
DROP TABLE "MarketCache";

-- DropEnum
DROP TYPE "Side";

-- CreateIndex
CREATE UNIQUE INDEX "User_proxyAddress_key" ON "User"("proxyAddress");
