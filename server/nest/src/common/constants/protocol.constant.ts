export const PACKET_CONFIG = {
  VERSION: 1,
  EVENT_NAME: 'b',
};

export enum Opcode {
  // System 0 - 9
  STREAM_HEARTBEAT = 0,
  STREAM_MESSAGE = 1,
  STREAM_METRICS = 2,

  // Chat 10 - 19
  MSG_TEXT = 10,
  MSG_PIN = 11,
  MSG_UNPIN = 12,
  MSG_DELETE = 13,

  // Room 20 - 29
  JOIN_ROOM = 20,
  LEAVE_ROOM = 21,
}

export const MAX_PACKET_SIZE = 1024 * 64;
export const MIN_PACKET_SIZE = 2;
