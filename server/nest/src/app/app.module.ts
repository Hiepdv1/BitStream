import { Module } from '@nestjs/common';
import { GlobalGuardModule } from './guards/global-guard.module';
import { GlobalFilterModule } from './filters/global.filter';
import { InterceptorModule } from './Interceptor/interceptor.module';
import { ValidationModule } from './validators/validation.module';

@Module({
  imports: [
    GlobalGuardModule,
    GlobalFilterModule,
    InterceptorModule,
    ValidationModule,
  ],
})
export class ApplicationModule {}
