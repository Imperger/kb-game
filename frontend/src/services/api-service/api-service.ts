import { isAxiosError } from '@/typeguards/axios-typeguard';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as httpAdapter from 'axios/lib/adapters/http';
import * as settle from 'axios/lib/core/settle';

import AuthApi from './auth/auth-api';
import { SpawnerApi } from './spawner/spawner-api';
import UserApi from './user/user-api';
import GameApi from './game/game-api';
import ScenarioApi from './scenario/scenario-api';
import PlayerApi from './player/player-api';
import ReplayApi from './replay/replay-api';

export { UnauthorizedHandler } from './auth/auth-api';

export default class ApiService {
  private readonly axios: AxiosInstance;
  private readonly authApi: AuthApi = new AuthApi();
  private readonly userApi: UserApi = new UserApi();
  private readonly playerApi: PlayerApi = new PlayerApi();
  private readonly spawnerApi: SpawnerApi = new SpawnerApi();
  private readonly scenarioApi: ScenarioApi = new ScenarioApi();
  private readonly gameApi = new GameApi();
  private readonly replayApi = new ReplayApi();

  constructor (baseURL: string, accessToken = '') {
    this.axios = axios.create({ baseURL, adapter: ApiService.UnauthorizedIsNotThrowsAdapter });
    this.auth.httpClient = this.axios;
    this.auth.accessToken = accessToken;

    this.userApi.httpClient = this.axios;
    this.playerApi.httpClient = this.axios;
    this.spawnerApi.httpClient = this.axios;
    this.gameApi.httpClient = this.axios;
    this.scenarioApi.httpClient = this.axios;
    this.replayApi.httpClient = this.axios;
  }

  get auth (): AuthApi {
    return this.authApi;
  }

  get user (): UserApi {
    return this.userApi;
  }

  get player (): PlayerApi {
    return this.playerApi;
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

  get replay (): ReplayApi {
    return this.replayApi;
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
          if (status >= 400 && status < 600) {
            return { ...e.response, data: JSON.stringify({ ...JSON.parse(e.response.data as string), rejectedResponse: true }) };
          }
        }
      }

      throw e;
    }
  }
}
