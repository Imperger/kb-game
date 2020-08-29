import { AuthGuard } from '@nestjs/passport';

export class LoginByEmailGuard extends AuthGuard('email') { }