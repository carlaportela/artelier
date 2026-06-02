-- CreateIndex
CREATE INDEX "CustomOrderRequest_artisanId_status_deletedAt_idx" ON "CustomOrderRequest"("artisanId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "CustomOrderRequest_buyerId_idx" ON "CustomOrderRequest"("buyerId");
