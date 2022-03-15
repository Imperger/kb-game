import { AuthGuard } from '@nestjs/passport';

import { LoginByEmailStrategyName } from '../constants';

export class LoginByEmailGuard extends AuthGuard(LoginByEmailStrategyName) { }