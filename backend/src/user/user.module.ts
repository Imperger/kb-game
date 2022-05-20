import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserService } from './user.service';
import { User, UserSchema } from '../common/schemas/user.schema';
import { CurrentUserPipe } from './pipes/current-user.pipe';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  providers: [UserService, CurrentUserPipe],
  exports: [UserService]
})
export class UserModule { }
