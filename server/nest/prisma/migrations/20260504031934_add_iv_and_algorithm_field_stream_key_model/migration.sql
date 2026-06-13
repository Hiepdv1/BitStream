-- AlterTable
ALTER TABLE "StreamKey" ADD COLUMN     "algorithm" TEXT NOT NULL DEFAULT 'aes-256-cbc',
ADD COLUMN     "iv" TEXT;
