import { HttpStatus } from '@nestjs/common';

import { AppException } from '../filters/app-exception/app-exception';
import { StatusCode } from '../types/status-code';

export class RecaptchaException extends AppException {
    code = StatusCode.CaptchaFailed;
    httpCode = HttpStatus.UNAUTHORIZED;
    message = 'Invalid recaptcha.';
}