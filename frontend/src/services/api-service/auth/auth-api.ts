import { AxiosError, AxiosInstance } from 'axios';

import isEmail from 'validator/es/lib/isEmail';
import {
  LoginResponse,
  RegisterResponse,
  RegistrationConfirmResponse,
  StatusCode
} from './types';

export type UnauthorizedHandler<T> = (error: T) => void;

export default class AuthApi {
  private token = '';
  private http!: AxiosInstance;
  private unauthHandler: number | null = null;

  set httpClient (httpClient: AxiosInstance) {
    this.http = httpClient;
  }

  set accessToken (token: string) {
    this.token = token;

    if (token.length) { this.updateAuthorizationHeader(); }
  }

  get accessToken (): string {
    return this.token;
  }

  unauthorizeHandler (handler: UnauthorizedHandler<AxiosError>): void {
    if (this.unauthHandler !== null) {
      this.http.interceptors.response.eject(this.unauthHandler);
    }

    this.unauthHandler = this.http.interceptors.response.use(r => r, (error: AxiosError) => {
      if (error.response?.status === 401) {
        handler(error);
      }

      return Promise.reject(error);
    });
  }

  async register (username: string, email: string, password: string, reCaptchaResponse: string): Promise<RegisterResponse> {
    return (await this.http.post<RegisterResponse>('auth/register',
      { username, email, password },
      { headers: { recaptcha: reCaptchaResponse } })).data;
  }

  async confirmRegistration (code: string): Promise<RegistrationConfirmResponse> {
    return (await this.http.patch<RegistrationConfirmResponse>('auth/registration/confirm', { code })).data;
  }

  async login (usernameOrEmail: string, password: string, reCaptchaResponse: string): Promise<LoginResponse> {
    return isEmail(usernameOrEmail)
      ? await this.loginEmail(usernameOrEmail, password, reCaptchaResponse)
      : await this.loginUsername(usernameOrEmail, password, reCaptchaResponse);
  }

  async loginUsername (username: string, password: string, reCaptchaResponse: string): Promise<LoginResponse> {
    const response: LoginResponse = (await this.http.post('auth/login/username',
      { username, password },
      { headers: { recaptcha: reCaptchaResponse } })).data;

    const success = response.code === StatusCode.Ok;

    if (success) {
      this.accessToken = response.token as string;
    }

    return response;
  }

  async loginEmail (email: string, password: string, reCaptchaResponse: string): Promise<LoginResponse> {
    const response: LoginResponse = (await this.http.post('auth/login/email',
      { email, password },
      { headers: { recaptcha: reCaptchaResponse } })).data;

    const success = response.code === StatusCode.Ok;

    if (success) {
      this.accessToken = response.token as string;
    }

    return response;
  }

  testJwt (): Promise<unknown> {
    return this.http.get('auth/testjwt');
  }

  private updateAuthorizationHeader () {
    this.http.defaults.headers.common.Authorization = `Bearer ${this.token}`;
  }
}
