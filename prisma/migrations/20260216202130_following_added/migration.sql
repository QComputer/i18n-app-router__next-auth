-- CreateEnum
CREATE TYPE "FollowingTargetType" AS ENUM ('ORGANIZATION', 'SERVICE', 'SERVICE_CATEGORY', 'SERVICE_TYPE', 'STAFF', 'CLIENT');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "avatarImage" TEXT,
ADD COLUMN     "coverImage" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "avatarImage" TEXT,
ADD COLUMN     "coverImage" TEXT;

-- AlterTable
ALTER TABLE "ServiceCategory" ADD COLUMN     "avatarImage" TEXT,
ADD COLUMN     "coverImage" TEXT;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "avatarImage" TEXT,
ADD COLUMN     "coverImage" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarImage" TEXT,
ADD COLUMN     "coverImage" TEXT;

-- CreateTable
CREATE TABLE "Following" (
    "id" TEXT NOT NULL,
    "TargetType" "FollowingTargetType" NOT NULL DEFAULT 'ORGANIZATION',
    "targetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Following_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Following" ADD CONSTRAINT "Following_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
