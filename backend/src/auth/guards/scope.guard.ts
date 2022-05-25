import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from 'src/common/schemas/user.schema';
import { Scope, scopeMetaId } from '../scopes';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const user: User = context.switchToHttp().getRequest().user;

    return (this.reflector
      .get<Scope[]>(scopeMetaId, context.getHandler()) || [])
      .every(scope => this.checkScope(scope, user));
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