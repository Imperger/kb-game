import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ms from 'ms';

import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService
  ) {}

  async findByEmail(email: string) {
    return this.userModel
      .findOne({ email })
      .collation({ locale: 'en', strength: 1 });
  }

  async findByUsername(username: string) {
    return this.userModel
      .findOne({ username })
      .collation({ locale: 'en', strength: 1 });
  }

  async findByGoogleId(googleId: string) {
    return this.userModel.findOne({ ['externalIdentity.google']: googleId });
  }

  async findById(id: string) {
    return this.userModel.findOne({ _id: id });
  }

  async updateSecret(id: string, secret: { salt: string; hash: string }) {
    return (
      (await this.userModel.updateOne({ _id: id }, { secret })).modifiedCount >
      0
    );
  }

  async clearExpiredRegistrations(
    username: string,
    email: string
  ): Promise<number> {
    try {
      const ttl = ms(this.configService.get<string>('auth.confirmCodeTtl'));
      const result = await this.userModel.deleteMany({
        $or: [
          {
            $and: [
              { username, confirmed: false },
              { $expr: { $lt: ['$createdAt', { $subtract: ['$$NOW', ttl] }] } }
            ]
          },
          {
            $and: [
              { email, confirmed: false },
              { $expr: { $lt: ['$createdAt', { $subtract: ['$$NOW', ttl] }] } }
            ]
          }
        ]
      });

      return result?.deletedCount || 0;
    } catch (e) {
      return 0;
    }
  }
}
