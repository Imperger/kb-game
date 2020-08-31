import { HttpException, HttpStatus } from '@nestjs/common';
import { UserValidationResult } from '../interfaces/user-validation-result';

export class RegistrationNotConfirmedException extends HttpException {
    constructor() {
        super({
            status: UserValidationResult.NotConfirmed,
            message: 'Pending confirm registration'
        },
            HttpStatus.UNAUTHORIZED);
    }
}