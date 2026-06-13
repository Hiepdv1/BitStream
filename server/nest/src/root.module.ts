import { Module } from '@nestjs/common';
import { MainModule } from './modules/main.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ApplicationModule } from './app/app.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [InfrastructureModule, ApplicationModule, MainModule],
})
export class RootModule {}
