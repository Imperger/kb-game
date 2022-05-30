import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.cer'),
  };

  const app = await NestFactory.create(
    AppModule,
    new FastifyAdapter({ https: httpsOptions }),
  );
  app.enableCors();
  await app.listen(3002);
}
bootstrap();
