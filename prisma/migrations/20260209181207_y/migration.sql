-- DropIndex
DROP INDEX "Staff_organizationId_key";

-- CreateIndex
CREATE INDEX "Staff_userId_idx" ON "Staff"("userId");
