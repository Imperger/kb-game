import { HttpStatus } from '@nestjs/common';

import { AppException } from '@/common/filters/app-exception/app-exception';
import { StatusCode } from '@/common/types/status-code';

export class InvalidRecaptchaException extends AppException {
  code = StatusCode.CaptchaFailed;
  httpCode = HttpStatus.UNAUTHORIZED;
  message = 'Invalid recaptcha.';
}