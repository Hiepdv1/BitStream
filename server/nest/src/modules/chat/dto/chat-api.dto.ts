import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetVodChatHistoryDto {
  @IsString()
  @IsNotEmpty()
  s: string;

  @IsNumber()
  @IsOptional()
  from?: number;

  @IsNumber()
  @IsOptional()
  to?: number;

  @IsNumber()
  @IsOptional()
  limit: number = 30;
}
