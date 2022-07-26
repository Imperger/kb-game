import { AuthGuard } from '@nestjs/passport';

import { RegistrationConfirmStrategyName } from '@/auth/constants';

export class RegistrationConfirmGuard extends AuthGuard(
  RegistrationConfirmStrategyName
) {}
