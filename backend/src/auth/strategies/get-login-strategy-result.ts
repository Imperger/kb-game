import { UnauthorizedException } from '@nestjs/common';

import { UserValidationResult } from '../interfaces/user-validation-result';
import { RegistrationNotConfirmedException } from '../exceptions/registration-not-confirmed-exception';

export const GetLoginStrategyResult = (result: UserValidationResult) => {
    switch (result) {
        case UserValidationResult.Ok:
            return true;
        case UserValidationResult.NotFound:
        case UserValidationResult.InvalidCredentials:
            throw new UnauthorizedException();
        case UserValidationResult.NotConfirmed:
            throw new RegistrationNotConfirmedException();
    }
};