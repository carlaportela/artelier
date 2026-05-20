/*
  Warnings:

  - You are about to drop the column `participantId` on the `Conversation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[buyerId,artisanId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `artisanId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_participantId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "participantId",
ADD COLUMN     "artisanId" TEXT NOT NULL,
ADD COLUMN     "buyerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "locality" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_buyerId_artisanId_key" ON "Conversation"("buyerId", "artisanId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
