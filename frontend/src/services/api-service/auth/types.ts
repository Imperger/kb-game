export enum StatusCode {
  Ok = 0,
  InternalError = 1,
  // Registration
  CaptchaFailed = 10,
  UsernameIsTaken = 11,
  EmailIsTaken = 12,
  MissingUserForConfirmRegistration = 13,
  RegistrationAlreadyConfirmed = 14,
  // Authentication
  InvalidCredentials = 20,
  PendingConfirmRegistration = 21,
  PendingConfirmRegistrationExpired = 22
}

export interface LoginResponse {
  code: number;
  message?: string;
  token?: string;
}

export interface RegisterResponse {
  code: number;
  message?: string;
}

export interface RegistrationConfirmResponse {
  code: number;
  message: string;
}
