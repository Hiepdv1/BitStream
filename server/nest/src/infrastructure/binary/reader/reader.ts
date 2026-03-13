export class BinaryReader {
  private offset = 0;

  constructor(private readonly buffer: Buffer) {}

  private assertAvailable(len: number) {
    if (this.offset + len > this.buffer.length) {
      throw new Error(
        `BinaryReader: Unexpected end of buffer. Need ${len} bytes, but only ${this.remainingBytes} left.`,
      );
    }
  }

  get remainingBytes(): number {
    return this.buffer.length - this.offset;
  }

  // --- PRIMITIVE TYPES (Fixed Size) ---

  readUint8(): number {
    this.assertAvailable(1);
    const value = this.buffer.readUint8(this.offset);
    this.offset += 1;
    return value;
  }

  readUint16BE(): number {
    this.assertAvailable(2);
    const value = this.buffer.readUint16BE(this.offset);
    this.offset += 2;
    return value;
  }

  readUint32BE(): number {
    this.assertAvailable(4);
    const value = this.buffer.readUint32BE(this.offset);
    this.offset += 4;
    return value;
  }

  // --- VARIABLE TYPES (Length-Prefixed) ---

  readString8(): string {
    const len = this.readUint8();
    this.assertAvailable(len);
    const value = this.buffer.toString('utf8', this.offset, this.offset + len);
    this.offset += len;
    return value;
  }

  readString16(): string {
    const len = this.readUint16BE();
    this.assertAvailable(len);
    const value = this.buffer.toString('utf8', this.offset, this.offset + len);
    this.offset += len;
    return value;
  }

  readString32(): string {
    const len = this.readUint32BE();
    this.assertAvailable(len);
    const value = this.buffer.toString('utf8', this.offset, this.offset + len);
    this.offset += len;
    return value;
  }

  readBuffer(): Buffer {
    const len = this.readUint32BE();
    this.assertAvailable(len);
    const value = this.buffer.subarray(this.offset, this.offset + len);
    this.offset += len;
    return value;
  }

  readRawBytes(length: number): Buffer {
    this.assertAvailable(length);
    const value = this.buffer.subarray(this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  reset() {
    this.offset = 0;
  }
}
