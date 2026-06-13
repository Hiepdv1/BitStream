import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ProviderType } from 'src/generated/prisma/enums';

export class SetupPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @MinLength(8)
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;
}

export class UnlinkSocialAccountDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(ProviderType)
  provider: ProviderType;
}

export class ChangePasswordDto extends SetupPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @MinLength(8)
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  oldPassword: string;
}

export class UpdateProfileDto {
  @IsString()
  @MinLength(3, { message: 'Display name must be at least 3 characters long' })
  @MaxLength(50)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  bio?: string;
}

export class UpdateAvatarDto {
  thumbnail: Express.Multer.File;
}
