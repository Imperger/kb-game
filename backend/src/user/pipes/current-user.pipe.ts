import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

import { CurrentUser } from '../interfaces/current-user';
import { User as UserSchema } from '../../common/schemas/user.schema'

@Injectable()
export class CurrentUserPipe implements PipeTransform {
  transform(user: UserSchema, metadata: ArgumentMetadata): CurrentUser {
    return { 
      username: user.username,
      email: user.email,
      registeredAt: new Date(user.createdAt),
      scopes: {
        assignScope: user.scopes.assignScope,
        blockedUntil: new Date(user.scopes.blockedUntil),
        editScenario: user.scopes.editScenario,
        moderateChat: user.scopes.moderateChat,
        mutedUntil: new Date(user.scopes.mutedUntil)
      }
    };
  }
}