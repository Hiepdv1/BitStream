import { Opcode } from 'src/common/constants/protocol.constant';

export class BinaryWriter {
  private chunks: Buffer;
  private offset: number = 0;

  constructor(initialSize = 1024) {
    this.chunks = Buffer.allocUnsafe(initialSize);
  }

  private ensureCapacity(bytesToAdd: number) {
    if (this.offset + bytesToAdd > this.chunks.length) {
      const newSize = Math.max(
        this.chunks.length * 2,
        this.offset + bytesToAdd,
      );
      const newBuffer = Buffer.allocUnsafe(newSize);

      this.chunks.copy(newBuffer, 0, 0, this.offset);
      this.chunks = newBuffer;
    }
  }

  // --- PRIMITIVE TYPES (Fixed Size) ---

  writeUint8(value: number) {
    if (value < 0 || value > 255) throw new Error('Uint8 out of range');
    this.ensureCapacity(1);
    this.chunks.writeUint8(value, this.offset);
    this.offset += 1;
  }

  writeUint16BE(value: number) {
    if (value < 0 || value > 65535) throw new Error('Uint16 out of range');
    this.ensureCapacity(2);
    this.chunks.writeUint16BE(value, this.offset);
    this.offset += 2;
  }

  writeUint32BE(value: number) {
    if (value < 0 || value > 4294967295) throw new Error('Uint32 out of range');
    this.ensureCapacity(4);
    this.chunks.writeUint32BE(value, this.offset);
    this.offset += 4;
  }

  // --- VARIABLE TYPES (Length-Prefixed) ---

  writeString8(value: string) {
    const byteLen = Buffer.byteLength(value, 'utf8');

    if (byteLen > 255)
      throw new Error('String too long for 1-byte length slot');

    this.ensureCapacity(1 + byteLen);

    this.chunks.writeUint8(byteLen, this.offset);
    this.offset += 1;

    this.chunks.write(value, this.offset, byteLen, 'utf8');
    this.offset += byteLen;
  }

  writeString16(value: string) {
    const byteLen = Buffer.byteLength(value, 'utf8');

    if (byteLen > 65535)
      throw new Error('String too long for 2-byte length slot');

    this.ensureCapacity(2 + byteLen);

    this.chunks.writeUint16BE(byteLen, this.offset);
    this.offset += 2;

    this.chunks.write(value, this.offset, byteLen, 'utf8');
    this.offset += byteLen;
  }

  writeString32(value: string) {
    const byteLen = Buffer.byteLength(value, 'utf8');

    if (byteLen > 4294967295) throw new Error('String too long');

    this.ensureCapacity(4 + byteLen);

    this.chunks.writeUint32BE(byteLen, this.offset);
    this.offset += 4;

    this.chunks.write(value, this.offset, byteLen, 'utf8');
    this.offset += byteLen;
  }

  writeBuffer(value: Buffer) {
    const len = value.length;

    this.ensureCapacity(4 + len);

    this.chunks.writeUint32BE(len, this.offset);
    this.offset += 4;

    value.copy(this.chunks, this.offset);
    this.offset += len;
  }

  writeRawBytes(value: Buffer) {
    const len = value.length;
    this.ensureCapacity(len);
    value.copy(this.chunks, this.offset);
    this.offset += len;
  }

  private getBuffer(): Buffer {
    return this.chunks.subarray(0, this.offset);
  }

  reset() {
    this.offset = 0;
  }

  static createPacket(opcode: Opcode, version = 1): BinaryWriter {
    const writer = new BinaryWriter();
    writer.writeUint8(version);
    writer.writeUint8(opcode);
    return writer;
  }

  finish(): Buffer {
    return this.getBuffer();
  }
}
