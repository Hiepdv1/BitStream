export const PACKET_VERSION = 1;

export enum Opcode {
  HEARTBEAT = 0,
  STREAM_MESSAGE = 1,
  MSG_TEXT = 10,
  MSG_EMOJI = 11,
  JOIN_ROOM = 20,
  LEAVE_ROOM = 21,
}

export class BinaryWriter {
  private buffer: ArrayBuffer;
  private view: DataView;
  private offset = 0;

  constructor(initialSize = 256) {
    this.buffer = new ArrayBuffer(initialSize);
    this.view = new DataView(this.buffer);
  }

  private ensureCapacity(bytesToAdd: number) {
    if (this.offset + bytesToAdd > this.buffer.byteLength) {
      const newSize = Math.max(
        this.buffer.byteLength * 2,
        this.offset + bytesToAdd,
      );
      const newBuffer = new ArrayBuffer(newSize);
      new Uint8Array(newBuffer).set(new Uint8Array(this.buffer));
      this.buffer = newBuffer;
      this.view = new DataView(this.buffer);
    }
  }

  writeUint8(value: number) {
    this.ensureCapacity(1);
    this.view.setUint8(this.offset, value);
    this.offset += 1;
  }

  writeUint16BE(value: number) {
    this.ensureCapacity(2);
    this.view.setUint16(this.offset, value, false);
    this.offset += 2;
  }

  writeUint32BE(value: number) {
    this.ensureCapacity(4);
    this.view.setUint32(this.offset, value, false);
    this.offset += 4;
  }

  writeString8(value: string) {
    const encoded = new TextEncoder().encode(value);
    if (encoded.length > 255)
      throw new Error("String too long for 1-byte length prefix");
    this.ensureCapacity(1 + encoded.length);
    this.view.setUint8(this.offset, encoded.length);
    this.offset += 1;
    new Uint8Array(this.buffer, this.offset, encoded.length).set(encoded);
    this.offset += encoded.length;
  }

  finish(): ArrayBuffer {
    return this.buffer.slice(0, this.offset);
  }

  static createPacket(opcode: Opcode, version = PACKET_VERSION): BinaryWriter {
    const writer = new BinaryWriter();
    writer.writeUint8(version);
    writer.writeUint8(opcode);
    return writer;
  }
}

export class BinaryReader {
  private view: DataView;
  private offset = 0;

  constructor(private readonly data: ArrayBuffer) {
    this.view = new DataView(data);
  }

  get remainingBytes(): number {
    return this.data.byteLength - this.offset;
  }

  private assertAvailable(len: number) {
    if (this.offset + len > this.data.byteLength) {
      throw new Error(
        `BinaryReader: need ${len} bytes, only ${this.remainingBytes} left`,
      );
    }
  }

  readUint8(): number {
    this.assertAvailable(1);
    const val = this.view.getUint8(this.offset);
    this.offset += 1;
    return val;
  }

  readUint16BE(): number {
    this.assertAvailable(2);
    const val = this.view.getUint16(this.offset, false);
    this.offset += 2;
    return val;
  }

  readUint32BE(): number {
    this.assertAvailable(4);
    const val = this.view.getUint32(this.offset, false);
    this.offset += 4;
    return val;
  }

  readString8(): string {
    const len = this.readUint8();
    this.assertAvailable(len);
    const bytes = new Uint8Array(this.data, this.offset, len);
    this.offset += len;
    return new TextDecoder().decode(bytes);
  }
}
