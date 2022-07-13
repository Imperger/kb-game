import * as crypto from 'crypto';
import * as util from 'util';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { MongoError } from 'mongodb';
import { Model } from 'mongoose';
import ms from 'ms';

import { User } from '@/user/schemas/user.schema';
import { UserService } from '@/user/user.service';
import { ExtractDuplicateKey } from '@/common/util/mongo-error-parser';
import { UsernameIsTakenException } from './exceptions/username-is-taken.exception';
import { EmailIsTakenException } from './exceptions/email-is-taken.exception';
import { UnknownRegistrationException } from '@/auth/exceptions/unknown-registration.exception';
import { RegistrationAlreadyConfirmedException } from './exceptions/registration-already-confirmed.exception';
import { UnknownUserForConfirmRegistrationException } from './exceptions/object-of-confirmation-missing.exception';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { RegistrationNotConfirmedException } from './exceptions/registration-not-confirmed-exception';
import { timeDiff } from '@/common/util/time-diff';
import { RegistrationConfirmExpiredException } from './exceptions/registration-confirm-expired-exception';
import { PlayerService } from '@/player/player.service';
import { ConfigHelperService } from '@/config/config-helper.service';
import { LoggerService } from '@/logger/logger.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly userService: UserService,
    private readonly playerService: PlayerService,
    private readonly configService: ConfigService,
    private readonly configHelperService: ConfigHelperService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
    @InjectModel(User.name) private readonly userModel: Model<User>) { }

  async registerUser(username: string, email: string, password: string): Promise<string> {
    const createUser = new this.userModel({ username, email, confirmed: false, secret: await AuthService.buildSecret(password), scopes: {} });

    try {
      this.userService.clearExpiredRegistrations(username, email);

      const userId = (await createUser.save()).id;
      this.mailerService.sendMail({
        from: `no-reply@${this.configService.get<string>('hostname')}`,
        to: email,
        subject: 'new_user',
        html: `<span>${this.buildConfirmURL(userId)}</span>`
      });

      return userId;
    }
    catch (e) {
      if (e instanceof MongoError) {
        if (e.code === 11000) {
          const k = ExtractDuplicateKey(e.message);

          if (k.startsWith('username')) {
            this.logger.warn(`Username already taken '${username}'`, 'AuthService::SignUp');

            throw new UsernameIsTakenException();
          }
          else if (k.startsWith('email')) {
            this.logger.warn(`Email already taken '${email}'`, 'AuthService::SignUp');

            throw new EmailIsTakenException();
          }

          this.logger.error(`Unrecognized error with credentials '${username}:${email}:${password}'`, 'AuthService::SignUp');
          throw new UnknownRegistrationException();
        }

      }
    }
  }

  async updatePassword(id: string, password: string) {
    return (await this.userService.updateSecret(id, await AuthService.buildSecret(password)));
  }

  async confirmRegistration(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user) {
      this.logger.warn(`Can't find user '${userId}' for the confirmation request`, 'AuthService::SignUp');

      throw new UnknownUserForConfirmRegistrationException();
    }

    if (user.confirmed) {
      this.logger.warn(`The confirmation has already happened for the user '${userId}'`, 'AuthService::SignUp');

      throw new RegistrationAlreadyConfirmedException();
    }

    const player = await this.playerService.newPlayer(user.username);

    user.player = player;
    user.confirmed = true;

    await user.save();
  }

  async validateByEmail(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    await this.validateUser(user, password);

    return user;
  }

  async validateByUsername(username: string, password: string) {
    const user = await this.userService.findByUsername(username);

    await this.validateUser(user, password);

    return user;
  }

  private buildConfirmURL(userId: string) {
    const confirmCode = this.jwtService.sign(
      { id: userId },
      {
        expiresIn: this.configService.get<string>('auth.confirmCodeTtl'),
        secret: this.configService.get<string>('auth.registrationConfirmJwtSecret')
      });

    return `${this.configHelperService.apiEntry}/registration/confirm/${confirmCode}`;
  }

  async generateAccessToken(userId: string) {
    return this.jwtService.signAsync({ id: userId });
  }

  private async validateUser(user: User, password: string) {
    if (user === null || await AuthService.hashPassword(password, user.secret.salt) !== user.secret.hash) {
      this.logger.warn(`Invalid credentials for a user '${user?.id ?? '??'}:${user?.username ?? '??'}'`, 'AuthService::SignIn');

      throw new InvalidCredentialsException();
    }

    if (!user.confirmed) {
      if (timeDiff(new Date(), user.createdAt) > ms(this.configService.get<string>('auth.confirmCodeTtl'))) {
        this.logger.warn(`Expired the confirmation time '${user.id}:${user.username}'`, 'AuthService::SignIn');

        throw new RegistrationConfirmExpiredException();
      }

      this.logger.warn(`Pending the confirmation '${user.id}:${user.username}'`, 'AuthService::SignIn');

      throw new RegistrationNotConfirmedException();
    }
  }

  static async buildSecret(password: string) {
    const salt = AuthService.genSalt();
    return { hash: await AuthService.hashPassword(password, salt), salt };
  }

  static async hashPassword(password: string, salt: string) {
    const pbkdf2 = util.promisify(crypto.pbkdf2);

    const hash = await pbkdf2(password, salt, 100000, 64, 'sha512');
    return hash.toString('base64');
  }

  static genSalt() {
    return crypto.randomBytes(16).toString('base64');
  }

  static genConfirmCode() {
    return crypto.randomBytes(32).toString('base64');
  }
}