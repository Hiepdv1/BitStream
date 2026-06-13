import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { StreamVisibility } from 'src/generated/prisma/enums';

export class ThumbnailStream {
  @IsOptional()
  thumbnail?: Express.Multer.File;
}

export class StreamDto extends ThumbnailStream {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(5000)
  description?: string;

  @IsEnum(StreamVisibility)
  @IsNotEmpty()
  visibility: StreamVisibility;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(100, { each: true })
  @IsOptional()
  extractedTags?: string[] = [];
}

export class UpdateStreamDto extends ThumbnailStream {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(5000)
  description?: string;

  @IsEnum(StreamVisibility)
  @IsOptional()
  visibility?: StreamVisibility;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(100, { each: true })
  @IsOptional()
  extractedTags?: string[];
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

export enum StreamStatusQuery {
  ALL = 'ALL',
  LIVE = 'LIVE',
  ENDED = 'ENDED',
  DRAFT = 'DRAFT',
}

export class ListStreamQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(StreamStatusQuery)
  status: StreamStatusQuery = StreamStatusQuery.ALL;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}
