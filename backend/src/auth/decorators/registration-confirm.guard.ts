import { AuthGuard } from '@nestjs/passport';

export class RegistrationConfirmGuard extends AuthGuard('registration_confirm') { }