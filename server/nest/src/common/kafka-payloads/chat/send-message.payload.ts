import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ChatMesssageType, Prisma } from 'src/generated/prisma/client';
import { KafkaEventBase, KafkaRetryBase } from 'src/infrastructure/kafka/types';

export class SendMessagePayload
  extends KafkaEventBase
  implements KafkaRetryBase
{
  @IsString()
  @IsNotEmpty()
  action: 'INSERT' | 'UPDATE' | 'DELETE';

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  opcode: number;

  @IsString()
  @IsNotEmpty()
  streamID: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  message: string;

  @IsNotEmpty()
  @IsEnum(ChatMesssageType)
  type: ChatMesssageType;

  @IsString()
  @IsNotEmpty()
  userID: string;

  @IsNumber()
  @IsNotEmpty()
  offsetMs: number;

  @IsNumber()
  @IsNotEmpty()
  retryCount: number;

  @IsNumber()
  @IsNotEmpty()
  maxRetry: number;
}

export class ChatDLQPayload extends KafkaEventBase {
  streamID: string;
  reason: string;
  data: JSON;
}
