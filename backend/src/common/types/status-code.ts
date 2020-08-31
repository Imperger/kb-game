export enum StatusCode {
    Ok = 0,
    InternalError = 1,
    /** Authentication */
    CaptchaFailed = 10,
    UsernameIsTaken = 11,
    EmailIsTaken = 12
};