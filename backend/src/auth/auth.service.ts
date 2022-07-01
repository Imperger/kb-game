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
import { EmailService } from '@/email/email.service';
import { UserService } from '@/user/user.service';
import { ExtractDuplicateKey } from '@/common/util/mongo-error-parser';
import { UsernameIsTakenException } from './exceptions/username-is-taken.exception';
import { EmailIsTakenException } from './exceptions/email-is-taken.exception';
import { UnknownRegistrationException } from '@/auth/exceptions/unknown-registration.exception';
import { RegistrationAlreadyConfirmedException } from './exceptions/registration-already-confirmed.exception';
import { UnknownUserForConfirmRegistrationException } from './exceptions/object-of-confirmation-missing.exception';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { RegistrationNotConfirmedException } from './exceptions/registration-not-confirmed-exception';
import Config from '@/config';
import { timeDiff } from '@/common/util/time-diff';
import { RegistrationConfirmExpiredException } from './exceptions/registration-confirm-expired-exception';
import { PlayerService } from '@/player/player.service';
import { ConfigHelperService } from '@/config/config-helper.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly emailService: EmailService,
    private readonly userService: UserService,
    private readonly playerService: PlayerService,
    private readonly configService: ConfigService,
    private readonly configHelperService: ConfigHelperService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>) { }

  async registerUser(username: string, email: string, password: string) {
    const createUser = new this.userModel({ username, email, confirmed: false, secret: await AuthService.buildSecret(password), scopes: {} });

    try {
      this.userService.clearExpiredRegistrations(username, email);

      const userId = (await createUser.save()).id;
      this.emailService.send({
        from: `no-reply@${this.configService.get<string>('domain')}`,
        to: email,
        subject: 'new_user',
        html: `<span>${this.buildConfirmURL(userId)}</span>`
      });
    }
    catch (e) {
      if (e instanceof MongoError) {
        if (e.code === 11000) {
          const k = ExtractDuplicateKey(e.message);

          if (k.startsWith('username'))
            throw new UsernameIsTakenException();
          else if (k.startsWith('email'))
            throw new EmailIsTakenException();

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

    if (!user)
      throw new UnknownUserForConfirmRegistrationException();

    if (user.confirmed)
      throw new RegistrationAlreadyConfirmedException();

    const player = await this.playerService.newPlayer(user.username);
    
    user.player = player;
    user.confirmed = true;

    await user.save();
  }

  async validateByEmail(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    await AuthService.validateUser(user, password);

    return user;
  }

  async validateByUsername(username: string, password: string) {
    const user = await this.userService.findByUsername(username);

    await AuthService.validateUser(user, password);

    return user;
  }

  private buildConfirmURL(userId: string) {
    const confirmCode = this.jwtService.sign(
      { id: userId }, 
      { expiresIn: Config.auth.confirmCodeTtl, secret: Config.auth.registrationConfirmJwtSecret });
      
    return `${this.configHelperService.apiEntry}/registration/confirm/${confirmCode}`;
  }

  async generateAccessToken(userId: string) {
    return this.jwtService.signAsync({ id: userId });
  }

  static async validateUser(user: User, password: string) {
    if (user === null || await AuthService.hashPassword(password, user.secret.salt) !== user.secret.hash)
      throw new InvalidCredentialsException();

    if (!user.confirmed) {
      if (timeDiff(new Date(), user.createdAt) > ms(Config.auth.confirmCodeTtl)) {
        throw new RegistrationConfirmExpiredException();
      }
            
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