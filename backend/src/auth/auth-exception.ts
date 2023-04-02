import { HttpStatus } from '@nestjs/common';

import { AppException, exceptionGuardFactory } from '@/common/app-exception';

export enum AuthError {
  CaptchaFailed = 300,
  UsernameIsTaken,
  EmailIsTaken,
  GoogleIdIsTaken,
  MissingUserForConfirmRegistration,
  RegistrationAlreadyConfirmed,
  InvalidCredentials,
  PendingConfirmRegistration,
  PendingConfirmRegistrationExpired,
  UnrecognizedError
}

export class AuthException extends AppException {}

export class UsernameIsTakenException extends AuthException {
  code = AuthError.UsernameIsTaken;
  status = HttpStatus.CONFLICT;
  message = 'Username already taken.';
}

export class EmailIsTakenException extends AuthException {
  code = AuthError.EmailIsTaken;
  status = HttpStatus.CONFLICT;
  message = 'Email already taken.';
}

export class GoogleIdIsTaken extends AuthException {
  code = AuthError.GoogleIdIsTaken;
  status = HttpStatus.CONFLICT;
  message = 'Google id already taken.';
}

export class InvalidCredentialsException extends AuthException {
  code = AuthError.InvalidCredentials;
  status = HttpStatus.UNAUTHORIZED;
  message = 'Invalid credentials.';
}

export class UnknownUserForConfirmRegistrationException extends AuthException {
  code = AuthError.MissingUserForConfirmRegistration;
  status = HttpStatus.CONFLICT;
  message = 'Unknown user for confirm registration.';
}

export class RegistrationAlreadyConfirmedException extends AuthException {
  code = AuthError.RegistrationAlreadyConfirmed;
  status = HttpStatus.CONFLICT;
  message = 'Registration already confirmed.';
}

export class RegistrationConfirmExpiredException extends AuthException {
  code = AuthError.PendingConfirmRegistrationExpired;
  status = HttpStatus.UNAUTHORIZED;
  message = 'Registration confirm expired.';
}

export class RegistrationNotConfirmedException extends AuthException {
  code = AuthError.PendingConfirmRegistration;
  status = HttpStatus.UNAUTHORIZED;
  message = 'Pending confirm registration.';
}

export class UnknownRegistrationException extends AuthException {
  code = AuthError.UnrecognizedError;
  status = HttpStatus.INTERNAL_SERVER_ERROR;
  message = 'Unknown registration exception.';
}

export const isAuthException = exceptionGuardFactory(AuthException, {
  min: 300,
  max: 400
});
