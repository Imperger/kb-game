import { UserService } from '@/user/user.service';
import { CanActivate, ExecutionContext, Injectable, Type } from '@nestjs/common';
import { InvalidCredentialsException } from '../auth-exception';

import { AuthService } from '../auth.service';

export function AuthGoogleGuard(populateUser: boolean): Type<CanActivate> {
  @Injectable()
  class AuthGoogleGuard implements CanActivate {
    constructor(
      public readonly authService: AuthService,
      public readonly userService: UserService
    ) {}
      
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const idToken = request.body?.idToken;
        
      if (!idToken) {
        throw new InvalidCredentialsException();
      }
        
      const credentials = await this.authService.verifyGoolgeCredentials(idToken);
        
      if (credentials?.getPayload().email_verified) {
        request.credentials = credentials;
          

        if (populateUser) {
          const user = await this.userService.findByGoogleId(credentials.getPayload().sub);
          
          if (user) {
            request.user = user;

            return true;
          } else {
            throw new InvalidCredentialsException();
          }
        }

        return true;
      }
        
      throw new InvalidCredentialsException();
    }
  }
  
  return AuthGoogleGuard;
}