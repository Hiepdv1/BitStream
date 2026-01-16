import { Expose } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { StreamVisibility } from 'src/generated/prisma/enums';

export class StreamDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(1000)
  description?: string;

  @IsEnum(StreamVisibility)
  @IsNotEmpty()
  visibility: StreamVisibility;
}

export class StreamOnPublishDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  get streamId(): string {
    return this.name;
  }

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  app: string;

  @IsString()
  @IsNotEmpty()
  addr: string;

  @IsOptional() @IsString() clientid?: string;
  @IsOptional() @IsString() call?: string;
  @IsOptional() @IsString() flashver?: string;
  @IsOptional() @IsString() swfurl?: string;
  @IsOptional() @IsString() tcurl?: string;
  @IsOptional() @IsString() type?: string;

  @IsOptional() @IsString() pageurl?: string;
}
