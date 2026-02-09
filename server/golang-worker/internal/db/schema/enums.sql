CREATE TYPE stream_visibility AS ENUM (
  'PUBLIC',
  'PRIVATE',
  'UNLISTED'
);

CREATE TYPE stream_event_type AS ENUM (
  'STREAM_START',
  'STREAM_STOP',
  'STREAM_CONNECT',
  'STREAM_DISCONNECT',
  'INVALID_KEY'
);