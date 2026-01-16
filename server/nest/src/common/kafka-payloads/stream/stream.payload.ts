import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { KafkaEventBase, KafkaRetryBase } from 'src/infrastructure/kafka/types';

export class StreamStartedPayload
  extends KafkaEventBase
  implements KafkaRetryBase
{
  @IsString()
  @IsNotEmpty()
  streamId: string;

  @IsString()
  @IsNotEmpty()
  rtmpUrl: string;

  @IsNumber()
  @IsNotEmpty()
  retryCount: number;

  @IsNumber()
  @IsNotEmpty()
  maxRetry: number;

  @IsString()
  @IsNotEmpty()
  action: 'START' | 'STOP';
}
