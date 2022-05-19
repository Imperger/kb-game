import axios, { AxiosInstance, AxiosResponse } from 'axios';
import isEmail from 'validator/es/lib/isEmail';
import {
  LoginResponse,
  RegisterResponse,
  RegistrationConfirmResponse
} from './api-service/interfaces';

export type UnauthorizedHandler<T> = (error: T) => T;

export default class ApiService {
    private axios: AxiosInstance;
    private unauthHandler: number | null = null;
    constructor (baseURL: string, private accessToken = '') {
      this.axios = axios.create({ baseURL });

      if (accessToken.length) { this.updateAuthorizationHeader(); }
    }

    setAccessToken (token: string): void {
      this.accessToken = token;

      if (token.length) { this.updateAuthorizationHeader(); }
    }

    unauthorizeHandler<T> (handler: UnauthorizedHandler<T>): void {
      if (this.unauthHandler !== null) {
        this.axios.interceptors.response.eject(this.unauthHandler);
      }

      this.unauthHandler = this.axios.interceptors.response.use(r => r, error => handler(error));
    }

    async register (username: string, email: string, password: string, reCaptchaResponse: string): Promise<RegisterResponse> {
      return (await this.axios.post<RegisterResponse>('auth/register',
        { username, email, password },
        { headers: { recaptcha: reCaptchaResponse } })).data;
    }

    async confirmRegistration (code: string): Promise<RegistrationConfirmResponse> {
      return (await this.axios.patch<RegistrationConfirmResponse>('auth/registration/confirm', { code })).data;
    }

    async login (usernameOrEmail: string, password: string, reCaptchaResponse: string): Promise<LoginResponse> {
      return isEmail(usernameOrEmail)
        ? this.loginEmail(usernameOrEmail, password, reCaptchaResponse)
        : this.loginUsername(usernameOrEmail, password, reCaptchaResponse);
    }

    async loginUsername (username: string, password: string, reCaptchaResponse: string): Promise<LoginResponse> {
      return (await this.axios.post('auth/login/username',
        { username, password },
        { headers: { recaptcha: reCaptchaResponse } })).data;
    }

    async loginEmail (email: string, password: string, reCaptchaResponse: string): Promise<LoginResponse> {
      return (await this.axios.post('auth/login/email',
        { email, password },
        { headers: { recaptcha: reCaptchaResponse } })).data;
    }
    }

    private updateAuthorizationHeader () {
      this.axios.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`;
    }
}
