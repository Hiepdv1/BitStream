-- AlterTable
ALTER TABLE "StreamMeta" ADD COLUMN     "ladders" JSONB,
ADD COLUMN     "sourceHeight" INTEGER,
ADD COLUMN     "sourceWidth" INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET DEFAULT ('user_' || substring(md5(random()::text), 1, 8));
