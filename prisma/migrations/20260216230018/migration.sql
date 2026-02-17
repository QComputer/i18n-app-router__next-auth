/*
  Warnings:

  - The values [PEODUCT_CATEGORY] on the enum `FollowingTargetType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FollowingTargetType_new" AS ENUM ('ORGANIZATION', 'SERVICE', 'SERVICE_CATEGORY', 'SERVICE_FIELD', 'PRODUCT', 'PRODUCT_CATEGORY', 'STAFF', 'DRIVER', 'CLIENT');
ALTER TABLE "public"."Following" ALTER COLUMN "TargetType" DROP DEFAULT;
ALTER TABLE "Following" ALTER COLUMN "TargetType" TYPE "FollowingTargetType_new" USING ("TargetType"::text::"FollowingTargetType_new");
ALTER TYPE "FollowingTargetType" RENAME TO "FollowingTargetType_old";
ALTER TYPE "FollowingTargetType_new" RENAME TO "FollowingTargetType";
DROP TYPE "public"."FollowingTargetType_old";
ALTER TABLE "Following" ALTER COLUMN "TargetType" SET DEFAULT 'ORGANIZATION';
COMMIT;
