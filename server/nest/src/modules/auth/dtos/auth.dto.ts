import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from 'src/common/validators';

export class CredentialsDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required for credentials' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required for credentials' })
  @MaxLength(30, { message: 'Password must be at most 20 characters long' })
  password: string;
}

export class SignUpDto {
  @IsString()
  @IsNotEmpty({ message: 'fullName is required for sign up' })
  @MinLength(4, { message: 'fullName must be at least 4 characters long' })
  fullName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required for credentials' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required for credentials' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(30, { message: 'Password must be at most 20 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirm Password is required for sign up' })
  @Match<SignUpDto>('password', {
    message: 'confirm password does not match password',
  })
  confirmPassword: string;
}
