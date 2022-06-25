import { isAxiosError } from '@/typeguards/axios-typeguard';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as httpAdapter from 'axios/lib/adapters/http';
import * as settle from 'axios/lib/core/settle';

import AuthApi from './auth/auth-api';
import { SpawnerApi } from './spawner/spawner-api';
import UserApi from './user/user-api';
import GameApi from './game/game-api';
import ScenarioApi from './scenario/scenario-api';

export { UnauthorizedHandler } from './auth/auth-api';

export default class ApiService {
  private axios: AxiosInstance;
  private authApi: AuthApi = new AuthApi();
  private userApi: UserApi = new UserApi();
  private spawnerApi: SpawnerApi = new SpawnerApi();
  private scenarioApi: ScenarioApi = new ScenarioApi();
  private readonly gameApi = new GameApi();

  constructor (baseURL: string, accessToken = '') {
    this.axios = axios.create({ baseURL, adapter: ApiService.UnauthorizedIsNotThrowsAdapter });
    this.auth.httpClient = this.axios;
    this.auth.accessToken = accessToken;

    this.userApi.httpClient = this.axios;
    this.spawnerApi.httpClient = this.axios;
    this.gameApi.httpClient = this.axios;
    this.scenarioApi.httpClient = this.axios;
  }

  get auth (): AuthApi {
    return this.authApi;
  }

  get user (): UserApi {
    return this.userApi;
  }

  get spawner (): SpawnerApi {
    return this.spawnerApi;
  }

  get scenario (): ScenarioApi {
    return this.scenarioApi;
  }

  get game (): GameApi {
    return this.gameApi;
  }

  private static async UnauthorizedIsNotThrowsAdapter (config: AxiosRequestConfig): Promise<AxiosResponse<unknown>> {
    try {
      const response = await httpAdapter(config);
      return await new Promise((resolve, reject) => {
        settle(resolve, reject, response);
      });
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response) {
          const status = e.response?.status;
          if (status >= 400 && status < 500) {
            return e.response;
          }
        }
      }

      throw e;
    }
  }
}
