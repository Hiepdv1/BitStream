-- CreateEnum
CREATE TYPE "HistoryAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "HistoryStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "action" "HistoryAction" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "is_entity_deleted" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB NOT NULL,
    "status" "HistoryStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "History_is_entity_deleted_type_idx" ON "History"("is_entity_deleted", "type");

-- CreateIndex
CREATE INDEX "History_entity_id_idx" ON "History"("entity_id");
