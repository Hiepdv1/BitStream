import { Controller, Get, Param, Post } from '@nestjs/common';
import { StudioService } from '../services/studio.service';
import { Ok } from 'src/common/response/response.helper';
import { SkipAuth } from 'src/common/decorators';
import { ReqPayload } from 'src/common/decorators/auth-payload';
import type { AuthPayload } from 'src/modules/auth/types/auth';

@Controller('/studio')
export class StudioController {
  constructor(private readonly studioService: StudioService) {}

  @Get('/:userID')
  @SkipAuth()
  public async getStudioInfo(@Param('userID') userID: string) {
    const info = await this.studioService.getStudioInfo(userID);

    return Ok(info);
  }

  @Post('/create')
  public async createStudio(@ReqPayload() auth: AuthPayload) {
    const data = await this.studioService.createStudio(auth);

    return Ok(data, 'create studio successfully');
  }
}
