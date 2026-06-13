/*
  Warnings:

  - You are about to drop the column `keyHash` on the `StreamKey` table. All the data in the column will be lost.
  - Added the required column `encryptedKey` to the `StreamKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StreamKey" DROP COLUMN "keyHash",
ADD COLUMN     "encryptedKey" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StreamToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StreamToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "_StreamToTag_B_index" ON "_StreamToTag"("B");

-- AddForeignKey
ALTER TABLE "_StreamToTag" ADD CONSTRAINT "_StreamToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StreamToTag" ADD CONSTRAINT "_StreamToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
