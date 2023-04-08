import { Test, TestingModule } from '@nestjs/testing';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';

import {
  EmailIsTakenException,
  RegistrationAlreadyConfirmedException,
  UnknownUserForConfirmRegistrationException,
  UsernameIsTakenException
} from '../auth-exception';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

import { LoggerService } from '@/logger/logger.service';
import { User } from '@/user/schemas/user.schema';
import { userStub } from '@/user/test/stubs/user.stub';

jest.mock('../../logger/logger.service');
jest.mock('../auth.service');

describe('Auth Controller', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GoogleRecaptchaModule.forRoot({
          secretKey: '',
          response: req => req.headers.recaptcha,
          skipIf: () => true
        })
      ],
      providers: [AuthService, LoggerService],
      controllers: [AuthController]
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('AuthController exists', () => {
    expect(controller).toBeDefined();
  });

  describe('AuthController.register', () => {
    let user: User;

    beforeEach(() => {
      user = userStub();
    });

    it('New unique', async () => {
      await expect(
        controller.register({
          username: 'unique',
          email: 'unique@mail.com',
          password: '12345678'
        })
      ).resolves.toEqual({});
    });

    it('Username is taken', async () => {
      await expect(
        controller.register({
          username: user.username,
          email: 'unique@mail.com',
          password: '12345678'
        })
      ).rejects.toThrowError(UsernameIsTakenException);
    });

    it('Email is taken', async () => {
      await expect(
        controller.register({
          username: 'unique',
          email: user.email,
          password: '12345678'
        })
      ).rejects.toThrowError(EmailIsTakenException);
    });
  });

  describe('AuthController.registrationConfirm', () => {
    let user: User;

    beforeEach(() => {
      user = userStub();
    });

    it('Confirmed', async () => {
      await expect(
        controller.registrationConfirm(userStub(false).id)
      ).resolves.toEqual({});
    });

    it('Unknown user', async () => {
      await expect(
        controller.registrationConfirm(user.id + userStub(false).id)
      ).rejects.toThrowError(UnknownUserForConfirmRegistrationException);
    });

    it('Already confirmed', async () => {
      await expect(
        controller.registrationConfirm(user.id)
      ).rejects.toThrowError(RegistrationAlreadyConfirmedException);
    });
  });

  describe('AuthController.loginEmail', () => {
    let user: User;

    beforeEach(() => {
      user = userStub();
    });

    it('Successfully', async () => {
      await expect(controller.loginEmail(user)).resolves.toEqual({
        token: await service.generateAccessToken(user.id)
      });
    });
  });

  describe('AuthController.loginUsername', () => {
    let user: User;

    beforeEach(() => {
      user = userStub();
    });

    it('Successfully', async () => {
      await expect(controller.loginUsername(user)).resolves.toEqual({
        token: await service.generateAccessToken(user.id)
      });
    });
  });
});
