/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" INTEGER NOT NULL DEFAULT 1;

-- DropEnum
DROP TYPE "UserRole";

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
