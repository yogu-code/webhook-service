/*
  Warnings:

  - Added the required column `updatedAt` to the `DeliveryLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "DeliveryLog" ADD COLUMN     "attempts" INTEGER,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
