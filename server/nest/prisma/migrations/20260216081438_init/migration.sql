-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STREAMER', 'VIEWER');

-- CreateEnum
CREATE TYPE "StreamVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');

-- CreateEnum
CREATE TYPE "StreamEventType" AS ENUM ('STREAM_START', 'STREAM_STOP', 'STREAM_CONNECT', 'STREAM_DISCONNECT', 'INVALID_KEY');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('CREDENTIALS', 'GOOGLE', 'DISCORD');

-- CreateEnum
CREATE TYPE "ChatMesssageType" AS ENUM ('TEXT', 'SYSTEM', 'DONATION', 'MEMBER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "avatar" TEXT,
    "name" TEXT DEFAULT ('user_' || substring(md5(random()::text), 1, 8)),
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "ProviderType" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "StreamVisibility" NOT NULL DEFAULT 'PUBLIC',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamMeta" (
    "id" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "totalDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "segmentCount" INTEGER NOT NULL DEFAULT 0,
    "lastSegmentSeq" INTEGER NOT NULL DEFAULT 0,
    "segmentDuration" INTEGER NOT NULL DEFAULT 2,
    "timescale" INTEGER NOT NULL DEFAULT 1000,
    "videoRepId" TEXT NOT NULL DEFAULT '0',
    "audioRepId" TEXT NOT NULL DEFAULT '1',
    "basePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreamMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamKey" (
    "id" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreamKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamEvent" (
    "id" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "type" "StreamEventType" NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreamEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "duration" INTEGER,
    "size" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewerSession" (
    "id" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "ViewerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "opcode" INTEGER NOT NULL,
    "streamId" TEXT NOT NULL,
    "userId" TEXT,
    "content" TEXT NOT NULL,
    "type" "ChatMesssageType" NOT NULL DEFAULT 'TEXT',
    "metaData" JSONB,
    "offsetMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedReason" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "Stream_userId_idx" ON "Stream"("userId");

-- CreateIndex
CREATE INDEX "Stream_isLive_idx" ON "Stream"("isLive");

-- CreateIndex
CREATE INDEX "Stream_visibility_idx" ON "Stream"("visibility");

-- CreateIndex
CREATE INDEX "Stream_createdAt_idx" ON "Stream"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StreamMeta_streamId_key" ON "StreamMeta"("streamId");

-- CreateIndex
CREATE INDEX "StreamMeta_streamId_idx" ON "StreamMeta"("streamId");

-- CreateIndex
CREATE UNIQUE INDEX "StreamKey_streamId_key" ON "StreamKey"("streamId");

-- CreateIndex
CREATE INDEX "StreamKey_streamId_idx" ON "StreamKey"("streamId");

-- CreateIndex
CREATE INDEX "StreamKey_isActive_idx" ON "StreamKey"("isActive");

-- CreateIndex
CREATE INDEX "StreamEvent_streamId_idx" ON "StreamEvent"("streamId");

-- CreateIndex
CREATE INDEX "StreamEvent_type_idx" ON "StreamEvent"("type");

-- CreateIndex
CREATE INDEX "StreamEvent_createdAt_idx" ON "StreamEvent"("createdAt");

-- CreateIndex
CREATE INDEX "StreamEvent_streamId_createdAt_idx" ON "StreamEvent"("streamId", "createdAt");

-- CreateIndex
CREATE INDEX "Recording_streamId_idx" ON "Recording"("streamId");

-- CreateIndex
CREATE INDEX "Recording_createdAt_idx" ON "Recording"("createdAt");

-- CreateIndex
CREATE INDEX "ViewerSession_streamId_idx" ON "ViewerSession"("streamId");

-- CreateIndex
CREATE INDEX "ViewerSession_startedAt_idx" ON "ViewerSession"("startedAt");

-- CreateIndex
CREATE INDEX "ChatMessage_streamId_idx" ON "ChatMessage"("streamId");

-- CreateIndex
CREATE INDEX "ChatMessage_streamId_offsetMs_idx" ON "ChatMessage"("streamId", "offsetMs");

-- CreateIndex
CREATE INDEX "ChatMessage_userId_idx" ON "ChatMessage"("userId");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamMeta" ADD CONSTRAINT "StreamMeta_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamKey" ADD CONSTRAINT "StreamKey_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamEvent" ADD CONSTRAINT "StreamEvent_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewerSession" ADD CONSTRAINT "ViewerSession_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
