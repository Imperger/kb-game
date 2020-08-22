import axios, { AxiosInstance } from 'axios';

export default class ApiService {
    private axios: AxiosInstance;
    constructor(baseURL: string, private accessToken = '') {
        this.axios = axios.create({ baseURL });
        this.updateAuthorizationHeader();
    }
    setAccessToken(token: string) {
        this.accessToken = token;
        this.updateAuthorizationHeader();
    }
    register(username: string, email: string, password: string, reCaptchaResponse: string) {
        return this.axios.post('/auth/register',
            { username, email, password, reCaptchaResponse },
            { headers: { recaptcha: reCaptchaResponse } });
    }
    private updateAuthorizationHeader() {
        this.axios.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`;
    }
}