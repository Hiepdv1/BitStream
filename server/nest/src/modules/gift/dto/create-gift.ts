import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  BasePaginationMeta,
  PagePaginationMeta,
} from 'src/common/response/response.types';
import { GiftTier, ShakeLevel } from 'src/generated/prisma/enums';

export class CreateGiftDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsEnum(GiftTier)
  @IsNotEmpty()
  tier: GiftTier;

  @IsEnum(ShakeLevel)
  @IsNotEmpty()
  shake_level: ShakeLevel;

  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;
}

export class CreateGiftFileDto {
  image: Express.Multer.File;
  effect: Express.Multer.File;
  sound?: Express.Multer.File;
}

export interface CreateGiftServiceDto extends CreateGiftDto {
  image: Express.Multer.File;
  effect?: Express.Multer.File;
  sound?: Express.Multer.File;
}

export class GetGiftsDto implements Omit<
  PagePaginationMeta,
  'total' | 'hasMore'
> {
  @IsNumber()
  page: number = 1;

  @IsNumber()
  limit: number = 12;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum([...Object.values(GiftTier), 'ALL'])
  @IsOptional()
  tier?: GiftTier | 'ALL';

  @IsEnum([...Object.values(ShakeLevel), 'ALL'])
  @IsOptional()
  shakeLevel?: ShakeLevel | 'ALL';

  @IsEnum(['ACTIVE', 'INACTIVE', 'ALL'])
  @IsOptional()
  status: 'ACTIVE' | 'INACTIVE' | 'ALL';

  @IsEnum(['NEWEST', 'OLDEST', 'PRICE_HIGH', 'PRICE_LOW'])
  @IsOptional()
  sort: 'NEWEST' | 'OLDEST' | 'PRICE_HIGH' | 'PRICE_LOW';
}

export class ActiveGiftDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  id: string;

  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;
}

export class UpdateGiftDisplaySettingsDto {
  @IsBoolean()
  @IsNotEmpty()
  is_chat_mode: boolean;

  @IsBoolean()
  @IsNotEmpty()
  is_stream_mode: boolean;
}
