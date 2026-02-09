-- =========================
-- STREAM
-- =========================

-- name: CreateStream :exec
INSERT INTO "Stream" (
  id, "userId", title, description, visibility
) VALUES (
  $1, $2, $3, $4, $5
);

-- name: UpdateStreamLive :exec
UPDATE "Stream"
SET "isLive" = $2,
    "endedAt" = CASE WHEN $2 = FALSE THEN now() ELSE NULL END,
    "updatedAt" = now()
WHERE id = $1;

-- name: SetStreamStarted :exec
UPDATE "Stream"
SET "startedAt" = now(),
    "updatedAt" = now()
WHERE id = $1;

-- name: UpdateStreamInfo :exec
UPDATE "Stream"
SET title = $2,
    description = $3,
    visibility = $4,
    "updatedAt" = now()
WHERE id = $1;

-- name: GetStreamByID :one
SELECT *
FROM "Stream"
WHERE id = $1;

-- name: GetLiveStreamByID :one
SELECT *
FROM "Stream"
WHERE id = $1
  AND "isLive" = TRUE;

-- name: ListLiveStreams :many
SELECT *
FROM "Stream"
WHERE "isLive" = TRUE
ORDER BY "createdAt" DESC
LIMIT $1;

-- =========================
-- STREAM META
-- =========================

-- name: GetStreamMeta :one
SELECT * FROM "StreamMeta"
WHERE "streamId" = $1;

-- name: CreateStreamMeta :exec
INSERT INTO "StreamMeta" (
  id, "streamId", "totalDuration", "segmentDuration", "timescale", "videoRepId", "audioRepId", "basePath"
) VALUES (
  $1, $2, 0, $3, $4, $5, $6, $7
);

-- name: UpdateStreamMeta :exec
UPDATE "StreamMeta"
SET "totalDuration" = $2,
    "segmentCount" = $3,
    "lastSegmentSeq" = $4,
    "segmentDuration" = $5,
    "timescale" = $6,
    "videoRepId" = $7,
    "audioRepId" = $8,
    "basePath" = $9,
    "updatedAt" = now()
WHERE "streamId" = $1;

-- name: ExistStreamMeta :one
SELECT EXISTS (
  SELECT 1
  FROM "StreamMeta"
  WHERE "streamId" = $1
);

-- =========================
-- STREAM KEY
-- =========================

-- name: GetActiveStreamKey :one
SELECT *
FROM "StreamKey"
WHERE "streamId" = $1
  AND "isActive" = TRUE
  AND ("expiresAt" IS NULL OR "expiresAt" > now());

-- name: TouchStreamKey :exec
UPDATE "StreamKey"
SET "lastUsedAt" = now()
WHERE "streamId" = $1;

-- name: DisableStreamKey :exec
UPDATE "StreamKey"
SET "isActive" = FALSE
WHERE "streamId" = $1;

-- =========================
-- STREAM EVENT
-- =========================

-- name: CreateStreamEvent :exec
INSERT INTO "StreamEvent" (
  id, "streamId", type, payload
) VALUES (
  $1, $2, $3, $4
);

-- name: GetStreamEvents :many
SELECT *
FROM "StreamEvent"
WHERE "streamId" = $1
ORDER BY "createdAt" DESC
LIMIT $2;

-- =========================
-- RECORDING
-- =========================

-- name: CreateRecording :exec
INSERT INTO "Recording" (
  id, "streamId", "fileUrl", duration, size
) VALUES (
  $1, $2, $3, $4, $5
);

-- name: GetRecordingsByStream :many
SELECT *
FROM "Recording"
WHERE "streamId" = $1
ORDER BY "createdAt" DESC;

-- ============================================
-- META QUERIES
-- ============================================

-- name: UpdateStreamMetaWithSegments :exec
UPDATE "StreamMeta"
SET "totalDuration" = $2,
    "segmentCount" = $3,
    "lastSegmentSeq" = $4,
    "segmentDuration" = $5,
    "timescale" = $6,
    "videoRepId" = $7,
    "audioRepId" = $8,
    "basePath" = $9,
    "updatedAt" = now()
WHERE "streamId" = $1;

-- ============================================
-- GARBAGE COLLECTION QUERIES
-- ============================================

-- name: GetStoppedStreamIDs :many
SELECT DISTINCT se."streamId"
FROM "StreamEvent" se
WHERE se.type = 'STREAM_STOP'
  AND se."createdAt" > $1;

-- name: GetOldEndedStreamIDs :many
SELECT id
FROM "Stream"
WHERE "isLive" = FALSE
  AND "endedAt" IS NOT NULL
  AND "endedAt" < $1;