export enum AuthError {
  CaptchaFailed = 300,
  UsernameIsTaken,
  EmailIsTaken,
  MissingUserForConfirmRegistration,
  RegistrationAlreadyConfirmed,
  InvalidCredentials,
  PendingConfirmRegistration,
  PendingConfirmRegistrationExpired,
  UnrecognizedError
}
