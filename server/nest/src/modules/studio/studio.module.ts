import { Module } from '@nestjs/common';
import { StudioController } from './controllers/stuido.controller';
import { StudioService } from './services/studio.service';

@Module({
  imports: [],
  controllers: [StudioController],
  providers: [StudioService],
  exports: [StudioService],
})
export class StudioModule {}
