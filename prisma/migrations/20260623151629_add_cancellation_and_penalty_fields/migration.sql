-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancellationReason" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pendingPenaltyInCents" INTEGER NOT NULL DEFAULT 0;
