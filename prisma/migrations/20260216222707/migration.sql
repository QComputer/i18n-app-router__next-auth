/*
  Warnings:

  - The values [SERVICE_TYPE] on the enum `FollowingTargetType` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUPERMARKET] on the enum `OrganizationType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[userId,targetId,TargetType]` on the table `Following` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'PICKEDUP', 'DELIVERED', 'RECEIVED', 'RATED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DELIVERY', 'PICKUP', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "FollowingTargetType_new" AS ENUM ('ORGANIZATION', 'SERVICE', 'SERVICE_CATEGORY', 'SERVICE_FIELD', 'PRODUCT', 'PEODUCT_CATEGORY', 'STAFF', 'DRIVER', 'CLIENT');
ALTER TABLE "public"."Following" ALTER COLUMN "TargetType" DROP DEFAULT;
ALTER TABLE "Following" ALTER COLUMN "TargetType" TYPE "FollowingTargetType_new" USING ("TargetType"::text::"FollowingTargetType_new");
ALTER TYPE "FollowingTargetType" RENAME TO "FollowingTargetType_old";
ALTER TYPE "FollowingTargetType_new" RENAME TO "FollowingTargetType";
DROP TYPE "public"."FollowingTargetType_old";
ALTER TABLE "Following" ALTER COLUMN "TargetType" SET DEFAULT 'ORGANIZATION';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrganizationType_new" AS ENUM ('LAWYER', 'DOCTOR', 'MARKET', 'RESTAURANT', 'SALON', 'OTHER');
ALTER TABLE "Organization" ALTER COLUMN "type" TYPE "OrganizationType_new" USING ("type"::text::"OrganizationType_new");
ALTER TYPE "OrganizationType" RENAME TO "OrganizationType_old";
ALTER TYPE "OrganizationType_new" RENAME TO "OrganizationType";
DROP TYPE "public"."OrganizationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Following" DROP CONSTRAINT "Following_userId_fkey";

-- AlterTable
ALTER TABLE "Following" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneVerified" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "coverImage" TEXT,
    "avatarImage" TEXT,
    "price" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'IRR',
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "slotInterval" INTEGER NOT NULL DEFAULT 30,
    "bufferTime" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "productCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "avatarImage" TEXT,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deviceFingerPrint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deviceFingerPrint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION,
    "productId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Path" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Path_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stop" (
    "id" TEXT NOT NULL,
    "latitudeStops" DOUBLE PRECISION NOT NULL,
    "longitudeStops" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "pathId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderType" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "isDone" BOOLEAN NOT NULL,
    "isReceived" BOOLEAN NOT NULL,
    "isAcceptedByOrganization" BOOLEAN NOT NULL,
    "isAcceptedByDriver" BOOLEAN,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "driverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_productCategoryId_idx" ON "Product"("productCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "deviceFingerPrint_userId_key" ON "deviceFingerPrint"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_productId_key" ON "Item"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_orderId_key" ON "Item"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Stop_pathId_key" ON "Stop"("pathId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_organizationId_key" ON "Order"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_userId_key" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Following_userId_idx" ON "Following"("userId");

-- CreateIndex
CREATE INDEX "Following_targetId_idx" ON "Following"("targetId");

-- CreateIndex
CREATE INDEX "Following_TargetType_idx" ON "Following"("TargetType");

-- CreateIndex
CREATE UNIQUE INDEX "Following_userId_targetId_TargetType_key" ON "Following"("userId", "targetId", "TargetType");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Following" ADD CONSTRAINT "Following_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deviceFingerPrint" ADD CONSTRAINT "deviceFingerPrint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Path" ADD CONSTRAINT "Path_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "Path"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
