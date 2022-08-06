import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Observable } from 'rxjs';

import { User } from '@/user/schemas/user.schema';
import { Scope } from '@/auth/scopes';
import { LoggerService } from '@/logger/logger.service';

export const ScopeGuard = (...scopes: Scope[]): Type<CanActivate> => {

  class ScopeGuardMixin implements CanActivate {
    constructor(
      private readonly logger: LoggerService
    ) { }

    canActivate(
      context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
      const req = context.switchToHttp().getRequest();
      const user: User = req.user;

      const authorized = scopes.every(scope => this.checkScope(scope, user));

      if (!authorized) {
        this.logger.warn(
          `Unauthorized access to '${req.method} ${req.url}' from user '${user.id}:${user.username}'`,
          'ScopeGuard'
        );
      }

      return authorized;
    }

    private checkScope(scope: Scope, user: User) {
      switch (scope) {
        case Scope.AssignScope:
          return user.scopes.assignScope;
        case Scope.ServerMaintainer:
          return user.scopes.serverMaintainer;
        case Scope.EditScenario:
          return user.scopes.editScenario;
        case Scope.ModerateChat:
          return user.scopes.moderateChat;
        case Scope.PlayGame:
          return user.scopes.blockedUntil < new Date();
        case Scope.WriteToChat:
          return user.scopes.mutedUntil < new Date();
      }
    }
  }

  return mixin(ScopeGuardMixin);
}
