import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

import { CurrentUser } from '@/user/interfaces/current-user';
import { User as UserSchema } from '@/user/schemas/user.schema';

@Injectable()
export class CurrentUserPipe implements PipeTransform {
  transform(user: UserSchema, metadata: ArgumentMetadata): CurrentUser {
    return {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      registeredAt: new Date(user.createdAt),
      scopes: {
        assignScope: user.scopes.assignScope,
        serverMaintainer: user.scopes.serverMaintainer,
        blockedUntil: new Date(user.scopes.blockedUntil),
        editScenario: user.scopes.editScenario,
        moderateChat: user.scopes.moderateChat,
        mutedUntil: new Date(user.scopes.mutedUntil)
      }
    };
  }
}
