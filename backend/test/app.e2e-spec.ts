
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

import { AppModule } from '@/app.module';
import { DtoValidationPipe } from '@/common/pipes/dto-validation.pipe';
import { User } from '@/user/schemas/user.schema';
import { userStub } from '@/user/test/stubs/user.stub';
import { AppExceptionFilter } from '@/common/filters/app-exception.filter';
import { LoggerService } from '@/logger/logger.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  const user = userStub();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));

    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    app.enableCors();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new AppExceptionFilter());
    app.useGlobalPipes(new DtoValidationPipe(app.get(LoggerService)));
    await app.init();

    await userModel.deleteOne({ username: user.username });
  });

  afterAll(() => app.close());

  it('/api/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ username: user.username, email: user.email, password: '12345678' })
      .expect(201)
      .expect({ });
  });
});
