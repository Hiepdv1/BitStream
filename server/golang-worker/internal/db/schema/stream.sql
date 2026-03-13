-- =========================
-- STREAM
-- =========================
CREATE TABLE IF NOT EXISTS "Stream" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,

  title TEXT NOT NULL,
  description TEXT,

  "isLive" BOOLEAN NOT NULL DEFAULT FALSE,
  visibility "StreamVisibility" NOT NULL DEFAULT 'PUBLIC',

  "startedAt" TIMESTAMPTZ,
  "endedAt"   TIMESTAMPTZ,

  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "idx_Stream_userId" ON "Stream"("userId");
CREATE INDEX "idx_Stream_isLive" ON "Stream"("isLive");
CREATE INDEX "idx_Stream_visibility" ON "Stream"(visibility);
CREATE INDEX "idx_Stream_createdAt" ON "Stream"("createdAt");

-- =========================
-- STREAM META
-- =========================
CREATE TABLE IF NOT EXISTS "StreamMeta" (
  id TEXT PRIMARY KEY,
  "streamId" TEXT UNIQUE NOT NULL,

  "totalDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "segmentCount" INTEGER NULL DEFAULT 0,
  "lastSegmentSeq" INTEGER NULL DEFAULT 0,

  "segmentDuration" INTEGER NOT NULL DEFAULT 2,
  "timescale"       INTEGER NOT NULL DEFAULT 1000,
  "videoRepId"      TEXT NOT NULL DEFAULT '0',
  "audioRepId"      TEXT NOT NULL DEFAULT '1',
  "basePath"        TEXT,

  "sourceWidth"     INTEGER,
  "sourceHeight"    INTEGER,
  "ladders"         JSONB,
  "vodManifestUrl"  TEXT,

  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "fk_StreamMeta_Stream"
    FOREIGN KEY ("streamId")
    REFERENCES "Stream"(id)
    ON DELETE CASCADE
);

CREATE INDEX "idx_StreamMeta_streamId" ON "StreamMeta"("streamId");

-- =========================
-- STREAM KEY
-- =========================
CREATE TABLE IF NOT EXISTS "StreamKey" (
  id TEXT PRIMARY KEY,
  "streamId" TEXT UNIQUE NOT NULL,

  "keyHash" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,

  "expiresAt" TIMESTAMPTZ,
  "lastUsedAt" TIMESTAMPTZ,

  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "fk_StreamKey_Stream"
    FOREIGN KEY ("streamId")
    REFERENCES "Stream"(id)
);

CREATE INDEX "idx_StreamKey_streamId" ON "StreamKey"("streamId");
CREATE INDEX "idx_StreamKey_isActive" ON "StreamKey"("isActive");

-- =========================
-- STREAM EVENT
-- =========================
CREATE TABLE IF NOT EXISTS "StreamEvent" (
  id TEXT PRIMARY KEY,
  "streamId" TEXT NOT NULL,

  type "StreamEventType" NOT NULL,
  payload JSONB,

  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "fk_StreamEvent_Stream"
    FOREIGN KEY ("streamId")
    REFERENCES "Stream"(id)
    ON DELETE CASCADE
);

CREATE INDEX "idx_StreamEvent_streamId" ON "StreamEvent"("streamId");
CREATE INDEX "idx_StreamEvent_type" ON "StreamEvent"(type);
CREATE INDEX "idx_StreamEvent_createdAt" ON "StreamEvent"("createdAt");

-- =========================
-- RECORDING
-- =========================
CREATE TABLE IF NOT EXISTS "Recording" (
  id TEXT PRIMARY KEY,
  "streamId" TEXT NOT NULL,

  "fileUrl" TEXT NOT NULL,
  duration INTEGER,
  size BIGINT,

  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "fk_Recording_Stream"
    FOREIGN KEY ("streamId")
    REFERENCES "Stream"(id)
    ON DELETE CASCADE
);

CREATE INDEX "idx_Recording_streamId" ON "Recording"("streamId");
CREATE INDEX "idx_Recording_createdAt" ON "Recording"("createdAt");

-- =========================
-- CHAT MESSAGE
-- =========================

CREATE TABLE "ChatMessage" (
    "id"            TEXT NOT NULL PRIMARY KEY,
    "opcode"        INTEGER NOT NULL,
    "streamId"      TEXT NOT NULL,
    "userId"        TEXT,
    "content"       TEXT NOT NULL,
    "type"          chat_message_type NOT NULL DEFAULT 'TEXT',
    "metaData"      JSONB, 
    "offsetMs"      INTEGER,
    "isDeleted"     BOOLEAN NOT NULL DEFAULT FALSE,
    "deletedAt"     TIMESTAMP(3) WITHOUT TIME ZONE,
    "deletedBy"     TEXT,
    "deletedReason" TEXT,
    "isPinned"      BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_streamId_fkey" FOREIGN KEY ("streamId") 
        REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ChatMessage_streamId_idx" ON "ChatMessage"("streamId");
CREATE INDEX "ChatMessage_streamId_offsetMs_idx" ON "ChatMessage"("streamId", "offsetMs");
CREATE INDEX "ChatMessage_userId_idx" ON "ChatMessage"("userId");
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");