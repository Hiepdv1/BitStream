/*
  Warnings:

  - Made the column `offsetMs` on table `ChatMessage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ShakeLevel" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "GiftTier" AS ENUM ('BASIC', 'RARE', 'EPIC', 'LEGENDARY');

-- AlterTable
ALTER TABLE "ChatMessage" ALTER COLUMN "offsetMs" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "Gift" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "effect_url" TEXT NOT NULL,
    "sound_url" TEXT,
    "duration" INTEGER NOT NULL,
    "tier" "GiftTier" NOT NULL,
    "shake_level" "ShakeLevel" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftTransaction" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "stream_id" TEXT NOT NULL,
    "gift_id" TEXT NOT NULL,
    "msg_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Gift_is_active_idx" ON "Gift"("is_active");

-- CreateIndex
CREATE INDEX "Gift_tier_idx" ON "Gift"("tier");

-- CreateIndex
CREATE INDEX "Gift_price_idx" ON "Gift"("price" DESC);

-- CreateIndex
CREATE INDEX "Gift_is_active_price_idx" ON "Gift"("is_active", "price" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "GiftTransaction_msg_id_key" ON "GiftTransaction"("msg_id");

-- CreateIndex
CREATE INDEX "GiftTransaction_stream_id_created_at_idx" ON "GiftTransaction"("stream_id", "created_at");

-- CreateIndex
CREATE INDEX "GiftTransaction_sender_id_created_at_idx" ON "GiftTransaction"("sender_id", "created_at");

-- CreateIndex
CREATE INDEX "GiftTransaction_receiver_id_created_at_idx" ON "GiftTransaction"("receiver_id", "created_at");

-- CreateIndex
CREATE INDEX "GiftTransaction_gift_id_idx" ON "GiftTransaction"("gift_id");

-- AddForeignKey
ALTER TABLE "GiftTransaction" ADD CONSTRAINT "GiftTransaction_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftTransaction" ADD CONSTRAINT "GiftTransaction_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftTransaction" ADD CONSTRAINT "GiftTransaction_msg_id_fkey" FOREIGN KEY ("msg_id") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftTransaction" ADD CONSTRAINT "GiftTransaction_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftTransaction" ADD CONSTRAINT "GiftTransaction_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "Gift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
