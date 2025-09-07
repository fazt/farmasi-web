/*
  Warnings:

  - Added the required column `condition` to the `guarantees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `guarantees` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."loans" DROP CONSTRAINT "loans_guaranteeId_fkey";

-- AlterTable
ALTER TABLE "public"."guarantees" ADD COLUMN     "condition" TEXT NOT NULL,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."loans" ALTER COLUMN "guaranteeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."loans" ADD CONSTRAINT "loans_guaranteeId_fkey" FOREIGN KEY ("guaranteeId") REFERENCES "public"."guarantees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
