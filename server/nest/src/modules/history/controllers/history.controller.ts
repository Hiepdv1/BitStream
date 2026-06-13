import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { HistoryService } from '../services/history.service';
import { Roles } from 'src/common/decorators';
import { Ok, paginatedResponse } from 'src/common/response/response.helper';
import { Role } from 'src/common/enums/role.enum';
import {
  GetHistoriesDto,
  RestoreHistoryDto,
  RollbackHistoryDto,
} from '../dtos/history.dto';
import { ReqPayload } from 'src/common/decorators/auth-payload';
import type { AuthPayload } from 'src/modules/auth/types/auth';

@Controller('/histories')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('/')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async getHistories(
    @ReqPayload() auth: AuthPayload,
    @Query() queries: GetHistoriesDto,
  ) {
    if (!auth) throw new UnauthorizedException('Unauthorized');

    const { data, meta } = await this.historyService.getHistories(
      auth,
      queries,
    );

    return paginatedResponse(data, meta);
  }

  @Get('/stats')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async getHistoryStats(@ReqPayload() auth: AuthPayload) {
    if (!auth) throw new UnauthorizedException('Unauthorized');

    const data = await this.historyService.getHistoryStats();

    return Ok(data);
  }

  @Post('/:historyId/restore')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async restoreHistory(
    @ReqPayload() auth: AuthPayload,
    @Param('historyId') historyId: string,
    @Body() body: RestoreHistoryDto,
  ) {
    if (!auth) throw new UnauthorizedException('Unauthorized');

    const data = await this.historyService.restoreHistory(
      auth,
      historyId,
      body.reason,
    );

    return Ok(data);
  }

  @Post('/:historyID/rollback')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async rollbackHistory(
    @ReqPayload() auth: AuthPayload,
    @Body() body: RollbackHistoryDto,
    @Param('historyID') historyID: string,
  ) {
    if (!auth) throw new UnauthorizedException('Unauthorized');

    const data = await this.historyService.rollbackHistory(
      auth,
      historyID,
      body.reason,
    );

    return Ok(data);
  }
}
