import { AxiosInstance, AxiosResponse } from 'axios';
import isEmail from 'validator/es/lib/isEmail';

import { isRejectedResponse, RejectedResponse } from '../rejected-response';

type EmptyObject = Record<string, never>;

export type UnauthorizedHandler<T> = (error: T) => void;

export interface LoginResponse {
  token?: string;
}

export interface UpdatePasswordRequest {
  password?: string;
  updatedPassword: string;
}

export interface PasswordValidationResponse {
  valid: boolean;
}

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

  unauthorizeHandler (handler: UnauthorizedHandler<AxiosResponse>): void {
    if (this.unauthHandler !== null) {
      this.http.interceptors.response.eject(this.unauthHandler);
    }

    this.unauthHandler = this.http.interceptors.response.use((response: AxiosResponse<unknown>) => {
      if (response?.status === 401) {
        handler(response);
      }

      return Promise.resolve(response);
    }, e => Promise.reject(e));
  }

  async register (
    username: string,
    email: string,
    password: string,
    reCaptchaResponse: string
  ): Promise<EmptyObject | RejectedResponse> {
    return (await this.http.post<EmptyObject>('auth/register',
      { username, email, password },
      { headers: { recaptcha: reCaptchaResponse } })).data;
  }

  async registerGoogle (idToken: string, reCaptchaResponse: string): Promise<EmptyObject | RejectedResponse> {
    return (await this.http.post<EmptyObject>('auth/register/google',
      { idToken },
      { headers: { recaptcha: reCaptchaResponse } })).data;
  }

  async confirmRegistration (
    code: string
  ): Promise<EmptyObject | RejectedResponse> {
    return (await this.http.patch<EmptyObject>('auth/registration/confirm', { code })).data;
  }

  async login (
    usernameOrEmail: string,
    password: string,
    reCaptchaResponse: string
  ): Promise<LoginResponse | RejectedResponse> {
    return isEmail(usernameOrEmail)
      ? await this.loginEmail(usernameOrEmail, password, reCaptchaResponse)
      : await this.loginUsername(usernameOrEmail, password, reCaptchaResponse);
  }

  async loginUsername (
    username: string,
    password: string,
    reCaptchaResponse: string): Promise<LoginResponse | RejectedResponse> {
    const response: LoginResponse = (await this.http.post('auth/login/username',
      { username, password },
      { headers: { recaptcha: reCaptchaResponse } })).data;

    if (!isRejectedResponse(response)) {
      this.accessToken = response.token as string;
    }

    return response;
  }

  async loginEmail (
    email: string,
    password: string,
    reCaptchaResponse: string
  ): Promise<LoginResponse | RejectedResponse> {
    const response: LoginResponse = (await this.http.post('auth/login/email',
      { email, password },
      { headers: { recaptcha: reCaptchaResponse } })).data;

    if (!isRejectedResponse(response)) {
      this.accessToken = response.token as string;
    }

    return response;
  }

  async loginGoogle (idToken: string, reCaptchaResponse: string): Promise<LoginResponse | RejectedResponse> {
    const response: LoginResponse = (await this.http.post('auth/login/google',
      { idToken },
      { headers: { recaptcha: reCaptchaResponse } })).data;

    if (!isRejectedResponse(response)) {
      this.accessToken = response.token as string;
    }

    return response;
  }

  async validatePassword (password: string, reCaptchaResponse: string): Promise<PasswordValidationResponse | RejectedResponse> {
    return (await this.http.post<PasswordValidationResponse>('auth/password/validate',
      { password },
      { headers: { recaptcha: reCaptchaResponse } })).data;
  }

  async updatePassword (options: UpdatePasswordRequest, reCaptchaResponse: string): Promise<EmptyObject | RejectedResponse> {
    return (await this.http.put<EmptyObject>('auth/password',
      options,
      { headers: { recaptcha: reCaptchaResponse } })).data;
  }

  signOut (): void {
    delete this.http.defaults.headers.common.Authorization;
  }

  private updateAuthorizationHeader () {
    this.http.defaults.headers.common.Authorization = `Bearer ${this.token}`;
  }
}
