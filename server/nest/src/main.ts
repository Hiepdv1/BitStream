import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { RootModule } from './root.module';
import { CorsService } from './infrastructure/cors/cors.service';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(RootModule);
  const corsService = app.get(CorsService);

  app.enableCors(corsService.createOptions());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap().catch((err) => console.error(err));
