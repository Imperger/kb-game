import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ms from 'ms';

import { User } from '../common/schemas/user.schema';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly configService: ConfigService) { }

    async findByEmail(email: string) { return this.userModel.findOne({ email }); }

    async findByUsername(username: string) { return this.userModel.findOne({ username }); }

    async findById(id: string) { return this.userModel.findOne({ _id: id }) }

    async ClearExpiredRegistrations(username: string, email: string) {
        try {
            const ttl = ms(this.configService.get<string>('auth.confirmCodeTtl'));
            const result = await this.userModel.remove({
                $or: [
                    { $and: [
                        { username, confirmed: false }, 
                        { $expr: { $lt: ['$createdAt', { $subtract: [ '$$NOW', ttl ] }] } }
                            ]},
                    { $and: [
                        { email, confirmed: false }, 
                        { $expr: { $lt: ['$createdAt', { $subtract: [ '$$NOW', ttl ] }] } }
                    ]}
                ]
            });

            return result?.n || 0;
        }catch(e) {
            return 0;
        }
    }
}
