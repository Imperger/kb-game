import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserService } from './user.service';
import { User, UserSchema } from '../common/schemas/user.schema';
import { CurrentUserPipe } from './pipes/current-user.pipe';
import { UserController } from './user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  providers: [UserService, CurrentUserPipe],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule { }
