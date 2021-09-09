import axios, { AxiosInstance, AxiosResponse } from 'axios';
import isEmail from 'validator/es/lib/isEmail';
import { LoginResponse } from './interfaces/login-response';
import { RegisterResponse } from './interfaces/register-response';
import { RegistrationConfirmResponse } from './interfaces/registration-confirm-response';

export default class ApiService {
    private axios: AxiosInstance;
    constructor (baseURL: string, private accessToken = '') {
      this.axios = axios.create({ baseURL });

      if (accessToken.length) { this.updateAuthorizationHeader(); }
    }

    setAccessToken (token: string): void {
      this.accessToken = token;

      if (token.length) { this.updateAuthorizationHeader(); }
    }

    register (username: string, email: string, password: string, reCaptchaResponse: string): Promise<AxiosResponse<RegisterResponse>> {
      return this.axios.post<RegisterResponse>('auth/register',
        { username, email, password },
        { headers: { recaptcha: reCaptchaResponse } });
    }

    confirmRegistration (code: string): Promise<AxiosResponse<RegistrationConfirmResponse>> {
      return this.axios.patch('auth/registration/confirm', { code });
    }

    login (usernameOrEmail: string, password: string, reCaptchaResponse: string): Promise<AxiosResponse<LoginResponse>> {
      return isEmail(usernameOrEmail)
        ? this.loginEmail(usernameOrEmail, password, reCaptchaResponse)
        : this.loginUsername(usernameOrEmail, password, reCaptchaResponse);
    }

    loginUsername (username: string, password: string, reCaptchaResponse: string): Promise<AxiosResponse<LoginResponse>> {
      return this.axios.post('auth/login/username',
        { username, password },
        { headers: { recaptcha: reCaptchaResponse } });
    }

    loginEmail (email: string, password: string, reCaptchaResponse: string): Promise<AxiosResponse<LoginResponse>> {
      return this.axios.post('auth/login/email',
        { email, password },
        { headers: { recaptcha: reCaptchaResponse } });
    }

    private updateAuthorizationHeader () {
      this.axios.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`;
    }
}
