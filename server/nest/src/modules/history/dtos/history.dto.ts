import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { PagePaginationMeta } from 'src/common/response/response.types';
import { HistoryAction, HistoryStatus } from 'src/generated/prisma/enums';

export class GetHistoriesDto implements Omit<
  PagePaginationMeta,
  'total' | 'hasMore'
> {
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @IsNumber()
  @IsOptional()
  limit: number = 12;

  @IsString()
  @IsOptional()
  search: string = '';

  @IsEnum(['NEWEST', 'OLDEST'])
  @IsOptional()
  sort: string = 'NEWEST';

  @IsString()
  @IsOptional()
  service: string = 'ALL';

  @IsEnum(['ALL', ...Object.values(HistoryAction)])
  @IsOptional()
  action: string = 'ALL';

  @IsEnum(['ALL', ...Object.values(HistoryStatus)])
  @IsOptional()
  status: string = 'ALL';
}

export class RestoreHistoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  reason: string;
}

export class RollbackHistoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  reason: string;
}
