import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { GoogleRecaptchaFilter } from './common/filters/recaptcha-exception.filter';
import { DtoValidationPipe } from './common/pipes/dto-validation.pipe';
import { LoggerService } from './logger/logger.service';
import { setupTestEnvironment } from './setup-test-environment';

async function bootstrap() {
  if (process.env.NODE_ENV === 'test') {
    await setupTestEnvironment();
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  process.once('SIGTERM', () => {
    app.close();
  });

  const logger = app.get(LoggerService);

  app.useLogger(logger);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AppExceptionFilter());
  app.useGlobalFilters(new GoogleRecaptchaFilter());
  app.useGlobalPipes(new DtoValidationPipe(logger));
  await app.listen(80, '0.0.0.0');
}
bootstrap();
