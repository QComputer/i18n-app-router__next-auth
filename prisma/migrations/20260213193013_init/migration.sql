/*
  Warnings:

  - You are about to drop the column `organizationId` on the `Service` table. All the data in the column will be lost.
  - Added the required column `serviceCategoryId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staffId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Hierarchy" ADD VALUE 'CLIENT';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'GUEST';

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_organizationId_fkey";

-- DropIndex
DROP INDEX "Service_organizationId_idx";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "organizationId",
ADD COLUMN     "serviceCategoryId" TEXT NOT NULL,
ADD COLUMN     "staffId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Service_staffId_idx" ON "Service"("staffId");

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
