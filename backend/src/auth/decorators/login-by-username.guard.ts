import { AuthGuard } from '@nestjs/passport';

import { LoginByUsernameStrategyName } from '../constants'

export class LoginByUsernameGuard extends AuthGuard(LoginByUsernameStrategyName) { }