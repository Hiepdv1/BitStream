import { Module } from '@nestjs/common';
import { BinaryReader } from './reader/reader';
import { BinaryWriter } from './write/write';

@Module({
  providers: [BinaryReader, BinaryWriter],
  exports: [BinaryReader, BinaryWriter],
})
export class BinaryModule {}
