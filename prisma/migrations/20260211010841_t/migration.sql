-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "recurringRule" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "bufferTime" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "bufferTime" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "StaffAvailability" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "StaffAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffAvailability_staffId_idx" ON "StaffAvailability"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffAvailability_staffId_dayOfWeek_key" ON "StaffAvailability"("staffId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Appointment_parentId_idx" ON "Appointment"("parentId");

-- AddForeignKey
ALTER TABLE "StaffAvailability" ADD CONSTRAINT "StaffAvailability_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
