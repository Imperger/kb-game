import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { DtoValidationPipe } from './common/pipes/dto-validation.pipe';

import Config from './config'
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CaptchaExceptionFilter } from './common/filters/captcha-exception.filter';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('../certs/server.key'),
    cert: fs.readFileSync('../certs/server.cer'),
  };
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ https: httpsOptions })); // TODO: Respect to config.ssl
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new CaptchaExceptionFilter());
  app.useGlobalPipes(new DtoValidationPipe());
  await app.listen(Config.port, '0.0.0.0');
}
bootstrap();
