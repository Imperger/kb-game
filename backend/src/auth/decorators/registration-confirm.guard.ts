import { AuthGuard } from '@nestjs/passport';

import { RegistrationConfirmStrategyName } from '../constants'

export class RegistrationConfirmGuard extends AuthGuard(RegistrationConfirmStrategyName) { }