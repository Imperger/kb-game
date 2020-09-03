export enum StatusCode {
    Ok = 0,
    InternalError = 1,
    // Authentication 
    // Registration
    CaptchaFailed = 10,
    UsernameIsTaken = 11,
    EmailIsTaken = 12,
    MissingUserForConfirmRegistration = 13,
    RegistrationAlreadyConfirmed = 14,
    // Login
    InvalidCredentials = 20,
    PendingConfirmRegistration = 21,

};