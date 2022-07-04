import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { DtoValidationPipe } from './common/pipes/dto-validation.pipe';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppExceptionFilter } from './common/filters/app-exception/app-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new AppExceptionFilter());
  app.useGlobalPipes(new DtoValidationPipe());
  await app.listen(80, '0.0.0.0');
}
bootstrap();
