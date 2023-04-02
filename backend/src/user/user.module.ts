import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CurrentUserPipe } from './pipes/current-user.pipe';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  providers: [UserService, CurrentUserPipe],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
