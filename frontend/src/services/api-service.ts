import axios, { AxiosInstance } from 'axios';
import isEmail from 'validator/es/lib/isEmail';
import { RegisterResponse } from './interfaces/register-response';

export default class ApiService {
    private axios: AxiosInstance;
    constructor(baseURL: string, private accessToken = '') {
        this.axios = axios.create({ baseURL });

        if (accessToken.length)
            this.updateAuthorizationHeader();
    }
    setAccessToken(token: string) {
        this.accessToken = token;

        if (token.length)
            this.updateAuthorizationHeader();
    }
    register(username: string, email: string, password: string, reCaptchaResponse: string) {
        return this.axios.post<RegisterResponse>('auth/register',
            { username, email, password },
            { headers: { recaptcha: reCaptchaResponse } });
    }
    registrationConfirm(code: string) {
        return this.axios.patch('auth/registration/confirm', { code });
    }
    login(usernameOrEmail: string, password: string, reCaptchaResponse: string) {
        return isEmail(usernameOrEmail) ?
            this.loginEmail(usernameOrEmail, password, reCaptchaResponse) :
            this.loginUsername(usernameOrEmail, password, reCaptchaResponse);
    }
    loginUsername(username: string, password: string, reCaptchaResponse: string) {
        return this.axios.post('auth/login/username',
            { username, password },
            { headers: { recaptcha: reCaptchaResponse } });
    }
    loginEmail(email: string, password: string, reCaptchaResponse: string) {
        return this.axios.post('auth/login/email',
            { email, password },
            { headers: { recaptcha: reCaptchaResponse } });
    }
    private updateAuthorizationHeader() {
        this.axios.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`;
    }
}