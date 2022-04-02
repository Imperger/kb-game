import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.cer'),
  };

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ https: httpsOptions })); // TODO: Respect to config.ssl
  
  app.enableCors();

  await app.listen(3001);
}
bootstrap();
