-- CreateEnum
CREATE TYPE "public"."TemplateType" AS ENUM ('WHATSAPP', 'CONTRACT');

-- AlterTable
ALTER TABLE "public"."contracts" ADD COLUMN     "templateId" TEXT;

-- AlterTable
ALTER TABLE "public"."guarantees" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "public"."templates" (
    "id" TEXT NOT NULL,
    "type" "public"."TemplateType" NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT,
    "content" TEXT NOT NULL,
    "richContent" TEXT,
    "category" TEXT,
    "variables" TEXT[],
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
