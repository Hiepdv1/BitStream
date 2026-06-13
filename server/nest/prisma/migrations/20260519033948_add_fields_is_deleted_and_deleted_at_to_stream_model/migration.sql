-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Stream_userId_isDeleted_idx" ON "Stream"("userId", "isDeleted");

-- CreateIndex
CREATE INDEX "Stream_isLive_isDeleted_idx" ON "Stream"("isLive", "isDeleted");

-- CreateIndex
CREATE INDEX "Stream_isDeleted_idx" ON "Stream"("isDeleted");
