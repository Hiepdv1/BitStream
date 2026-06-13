import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { GiftTier, ShakeLevel } from 'src/generated/prisma/enums';

export class UpdateGiftFileDto {
  image?: Express.Multer.File;
  effect?: Express.Multer.File;
  sound?: Express.Multer.File;
}

export class UpdateGiftDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsNumber()
  @IsOptional()
  duration: number;

  @IsEnum(GiftTier)
  @IsOptional()
  tier: GiftTier;

  @IsEnum(ShakeLevel)
  @IsOptional()
  shake_level: ShakeLevel;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_active: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_chatMode: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_streamMode: boolean;
}
