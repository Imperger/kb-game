import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { ShutdownService } from './shutdown.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  app.get(ShutdownService).subscribeToShutdown(() => app.close());
  app.enableCors();
  await app.listen(80, '0.0.0.0');
}
bootstrap();
