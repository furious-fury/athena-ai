/*
  Warnings:

  - You are about to drop the column `proxyAddress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `proxyBalance` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `proxyPrivateKey` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_proxyAddress_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "proxyAddress",
DROP COLUMN "proxyBalance",
DROP COLUMN "proxyPrivateKey";
