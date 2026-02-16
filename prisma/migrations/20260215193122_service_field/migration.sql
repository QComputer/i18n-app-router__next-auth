-- CreateTable
CREATE TABLE "ServiceField" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "ServiceField_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceField" ADD CONSTRAINT "ServiceField_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceField" ADD CONSTRAINT "ServiceField_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
