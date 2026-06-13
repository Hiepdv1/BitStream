-- AlterTable
ALTER TABLE "Gift" ADD COLUMN     "is_chatMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_streamMode" BOOLEAN NOT NULL DEFAULT false;
