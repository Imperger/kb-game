import * as crypto from 'crypto';
import * as util from 'util';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../common/schemas/user.schema';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import { UserValidationResult } from './interfaces/user-validation-result';
import Config from '../config';

@Injectable()
export class AuthService {
    constructor(
        private readonly emailService: EmailService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        @InjectModel(User.name) private readonly userModel: Model<User>) { }

    async registerUser(username: string, email: string, password: string) {
        const salt = AuthService.genSalt();
        const hash = await AuthService.hashPassword(password, salt);

        const createUser = new this.userModel({ username, email, confirmed: false, secret: { salt, hash } });
        const userId = (await createUser.save()).id;


        this.emailService.send({
            from: `no-reply@${this.configService.get<string>('domain')}`,
            to: email,
            subject: 'new_user',
            html: `<span>${this.buildConfirmURL(userId)}</span>`
        });
    }

    async validateByEmail(email: string, password: string) {
        const user = await this.userService.findByEmail(email);

        return await AuthService.validateUser(user, password);
    }

    async validateByUsername(username: string, password: string) {
        const user = await this.userService.findByUsername(username);

        return await AuthService.validateUser(user, password);
    }

    private buildConfirmURL(userId: string) {
        const ssl = this.configService.get<boolean>('ssl');
        const protocol = ssl ? 'https://' : 'http://';
        const domain = this.configService.get<string>('domain');
        const port = this.configService.get<number>('port');

        const confirmCode = this.jwtService.sign({ id: userId }, { expiresIn: Config.auth.confirmCodeTtl, secret: Config.auth.jwtSecret });
        return `${protocol}${domain}:${AuthService.isPortRequired(port, ssl) ? port : ''}/registration/confirm/${confirmCode}`;
    }

    static async validateUser(user: User, password: string) {
        if (user === null)
            return UserValidationResult.NotFound;

        if (!user.confirmed)
            return UserValidationResult.NotConfirmed;


        return await AuthService.hashPassword(password, user.secret.salt) === user.secret.hash ?
            UserValidationResult.Ok :
            UserValidationResult.InvalidCredentials;
    }

    static isPortRequired(port: number, ssl: boolean) {
        return ssl && port !== 443 ||
            !ssl && port !== 80;
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