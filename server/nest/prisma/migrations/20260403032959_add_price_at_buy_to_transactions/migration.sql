/*
  Warnings:

  - Added the required column `price_at_buy` to the `GiftTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gift" ALTER COLUMN "effect_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "GiftTransaction" ADD COLUMN     "price_at_buy" INTEGER NOT NULL;
