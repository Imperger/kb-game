import { AuthGuard } from '@nestjs/passport';

import { LoginByUsernameStrategyName } from '@/auth/constants'

export class LoginByUsernameGuard extends AuthGuard(LoginByUsernameStrategyName) { }