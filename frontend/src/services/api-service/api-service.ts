import axios, { AxiosInstance, AxiosResponse } from 'axios';

import AuthApi from './auth/auth-api';

export { UnauthorizedHandler } from './auth/auth-api';

export default class ApiService {
    private axios: AxiosInstance;
    private authApi: AuthApi = new AuthApi();

    constructor (baseURL: string, accessToken = '') {
      this.axios = axios.create({ baseURL });
      this.auth.httpClient = this.axios;
      this.auth.accessToken = accessToken;
    }

    get auth (): AuthApi {
      return this.authApi;
    }
}
