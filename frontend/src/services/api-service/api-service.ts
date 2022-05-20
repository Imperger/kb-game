import { isAxiosError } from '@/typeguards/axios-typeguard';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as httpAdapter from 'axios/lib/adapters/http';
import * as settle from 'axios/lib/core/settle';

import AuthApi from './auth/auth-api';

export { UnauthorizedHandler } from './auth/auth-api';

export default class ApiService {
    private axios: AxiosInstance;
    private authApi: AuthApi = new AuthApi();

    constructor (baseURL: string, accessToken = '') {
      this.axios = axios.create({ baseURL, adapter: ApiService.UnauthorizedIsNotThrowsAdapter });
      this.auth.httpClient = this.axios;
      this.auth.accessToken = accessToken;
    }

    get auth (): AuthApi {
      return this.authApi;
    }

    private static async UnauthorizedIsNotThrowsAdapter (config: AxiosRequestConfig): Promise<AxiosResponse<unknown>> {
      try {
        const response = await httpAdapter(config);
        return await new Promise((resolve, reject) => {
          settle(resolve, reject, response);
        });
      } catch (e) {
        if (isAxiosError(e)) {
          if (e.response?.status === 401) {
            return e.response;
          }
        }

        throw e;
      }
    }
}
