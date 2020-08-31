import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from '../common/schemas/user.schema';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async findByEmail(email: string) { return this.userModel.findOne({ email }); }

    async findByUsername(username: string) { return this.userModel.findOne({ username }); }
}
