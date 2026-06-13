/*
  Warnings:

  - You are about to drop the column `thumbnail_url` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Gift` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('PENDING', 'ACTIVE', 'SOFT_DELETED', 'HARD_DELETED');

-- CreateEnum
CREATE TYPE "GiftAssetType" AS ENUM ('IMAGE', 'EFFECT', 'SOUND');

-- DropForeignKey
ALTER TABLE "GiftTransaction" DROP CONSTRAINT "GiftTransaction_gift_id_fkey";

-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "thumbnail_url";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar";

-- DropTable
DROP TABLE "Gift";

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "bucketName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" "MediaStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "ownerUserId" TEXT,
    "streamId" TEXT,
    "giftId" TEXT,
    "giftAssetType" "GiftAssetType",

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gifts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "tier" "GiftTier" NOT NULL,
    "shake_level" "ShakeLevel" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_chatMode" BOOLEAN NOT NULL DEFAULT false,
    "is_streamMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_storageKey_key" ON "media"("storageKey");

-- CreateIndex
CREATE INDEX "media_status_createdAt_idx" ON "media"("status", "createdAt");

-- CreateIndex
CREATE INDEX "gifts_is_active_idx" ON "gifts"("is_active");

-- CreateIndex
CREATE INDEX "gifts_tier_idx" ON "gifts"("tier");

-- CreateIndex
CREATE INDEX "gifts_price_idx" ON "gifts"("price" DESC);

-- CreateIndex
CREATE INDEX "gifts_is_active_price_idx" ON "gifts"("is_active", "price" DESC);

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftTransaction" ADD CONSTRAINT "GiftTransaction_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
