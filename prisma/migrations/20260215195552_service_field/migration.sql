/*
  Warnings:

  - You are about to drop the column `staffId` on the `ServiceField` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceField" DROP CONSTRAINT "ServiceField_staffId_fkey";

-- AlterTable
ALTER TABLE "ServiceField" DROP COLUMN "staffId";

-- CreateTable
CREATE TABLE "_ServiceFieldToStaff" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServiceFieldToStaff_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ServiceFieldToStaff_B_index" ON "_ServiceFieldToStaff"("B");

-- AddForeignKey
ALTER TABLE "_ServiceFieldToStaff" ADD CONSTRAINT "_ServiceFieldToStaff_A_fkey" FOREIGN KEY ("A") REFERENCES "ServiceField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceFieldToStaff" ADD CONSTRAINT "_ServiceFieldToStaff_B_fkey" FOREIGN KEY ("B") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
