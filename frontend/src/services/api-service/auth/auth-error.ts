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
