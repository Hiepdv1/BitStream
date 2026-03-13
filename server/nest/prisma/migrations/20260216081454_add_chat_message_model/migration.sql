-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET DEFAULT ('user_' || substring(md5(random()::text), 1, 8));
