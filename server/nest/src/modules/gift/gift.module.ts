import { Module } from '@nestjs/common';
import { GiftController } from './controllers/gift.controller';
import { GiftService } from './services/gift.service';
import { GiftPolicyService } from './services/gift-policy.service';

@Module({
  imports: [],
  controllers: [GiftController],
  providers: [GiftService, GiftPolicyService],
  exports: [GiftService],
})
export class GiftModule {}
