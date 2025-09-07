/*
  Warnings:

  - You are about to drop the column `condition` on the `guarantees` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `guarantees` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `guarantees` table. All the data in the column will be lost.
  - You are about to drop the column `photo` on the `guarantees` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `guarantees` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `guarantees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."guarantees" DROP COLUMN "condition",
DROP COLUMN "description",
DROP COLUMN "location",
DROP COLUMN "photo",
DROP COLUMN "status",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "public"."loans" ADD COLUMN     "guarantorId" TEXT;

-- CreateTable
CREATE TABLE "public"."guarantee_photos" (
    "id" TEXT NOT NULL,
    "guaranteeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER,
    "mimeType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guarantee_photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."guarantee_photos" ADD CONSTRAINT "guarantee_photos_guaranteeId_fkey" FOREIGN KEY ("guaranteeId") REFERENCES "public"."guarantees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."loans" ADD CONSTRAINT "loans_guarantorId_fkey" FOREIGN KEY ("guarantorId") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
