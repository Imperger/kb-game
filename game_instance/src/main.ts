import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { ShutdownService } from './shutdown.service';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.cer'),
  };

  const app = await NestFactory.create(
    AppModule,
    new FastifyAdapter({ https: httpsOptions }),
  );
  app.get(ShutdownService).subscribeToShutdown(() => app.close());
  app.enableCors();
  await app.listen(3002, '0.0.0.0');
}
bootstrap();
