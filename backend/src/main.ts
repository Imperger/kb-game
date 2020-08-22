import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { DtoValidationPipe } from './pipes/dto-validation.pipe';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('../certs/server.key'),
    cert: fs.readFileSync('../certs/server.cer'),
  };
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ https: httpsOptions }));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new DtoValidationPipe());
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
