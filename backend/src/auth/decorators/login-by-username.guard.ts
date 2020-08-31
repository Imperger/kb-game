import { AuthGuard } from '@nestjs/passport';

export class LoginByUsernameGuard extends AuthGuard('username') { }