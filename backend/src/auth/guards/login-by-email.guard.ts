import { AuthGuard } from '@nestjs/passport';

import { LoginByEmailStrategyName } from '@/auth/constants';

export class LoginByEmailGuard extends AuthGuard(LoginByEmailStrategyName) {}
