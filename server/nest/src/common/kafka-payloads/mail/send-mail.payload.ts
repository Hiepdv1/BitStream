import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  isString,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { KafkaEventBase, KafkaRetryBase } from 'src/infrastructure/kafka/types';
import { MailTemplate } from './mail-template.enum';

class MailContext {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsUrl({ require_tld: false })
  url: string;

  @IsString()
  @IsNotEmpty()
  expiresIn: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  [key: string]: any;
}

export class SendMailPayload extends KafkaEventBase implements KafkaRetryBase {
  @IsEmail()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsEnum(MailTemplate)
  template: MailTemplate;

  @IsObject()
  @ValidateNested()
  @Type(() => MailContext)
  context: MailContext;

  @IsNumber()
  retryCount: number;

  @IsNumber()
  maxRetry: number;
}
