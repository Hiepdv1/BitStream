import {
  OffsetPaginationMeta,
  PagePaginationMeta,
} from '../response/response.types';

export class MetaHelper {
  static page(page: number, limit: number, total: number): PagePaginationMeta {
    return {
      page: page,
      limit: limit,
      total: total,
      hasMore: page * limit < total,
    };
  }

  static offset(
    limit: number,
    total: number,
    nextOffsetMs: number | null,
    hasMore: boolean,
  ): OffsetPaginationMeta {
    return {
      limit: limit,
      total: total,
      nextOffsetMs,
      hasMore,
    };
  }
}
