-- CreateEnum
CREATE TYPE "CancelledBy" AS ENUM ('BUYER', 'ARTISAN', 'SYSTEM');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "cancelledBy" "CancelledBy";
