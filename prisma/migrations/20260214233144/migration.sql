/*
  Warnings:

  - You are about to drop the column `organizationId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `staffId` on the `Appointment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_staffId_fkey";

-- DropIndex
DROP INDEX "Appointment_organizationId_idx";

-- DropIndex
DROP INDEX "Appointment_staffId_idx";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "organizationId",
DROP COLUMN "staffId";
