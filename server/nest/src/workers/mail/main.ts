import { NestFactory } from '@nestjs/core';
import { MailWorkerModule } from './mail.worker.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(MailWorkerModule);
}
bootstrap();
