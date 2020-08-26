import * as crypto from 'crypto';
import * as util from 'util';
import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
    constructor(
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
        @InjectModel(User.name) private readonly userModel: Model<User>) { }

    async registerUser(username: string, email: string, password: string) {
        const salt = AuthService.genSalt();
        const hash = await AuthService.hashPassword(password, salt);

        const createUser = new this.userModel({ username, email, secret: { salt, hash } });
        createUser.save();

        this.emailService.send({ from: `no-reply@${this.configService.get<string>('domain')}`, to: email, subject: 'new_user', html: 'confirmation_link' });
    }
    static async hashPassword(password: string, salt: string) {
        const pbkdf2 = util.promisify(crypto.pbkdf2);
        const hash = await pbkdf2(password, salt, 100000, 64, 'sha512');
        return hash.toString('hex');
    }
    static genSalt() {
        return crypto.randomBytes(16).toString('hex');
    }
}