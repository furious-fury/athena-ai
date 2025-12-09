/*
  Warnings:

  - A unique constraint covering the columns `[scwAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "scwAddress" TEXT,
ADD COLUMN     "scwFactoryAddress" TEXT,
ADD COLUMN     "scwOwnerPrivateKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_scwAddress_key" ON "User"("scwAddress");
