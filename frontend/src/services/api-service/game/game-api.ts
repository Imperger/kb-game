import { AxiosInstance } from 'axios';
import { RejectedResponse } from '../rejected-response';

export interface NewGameDescriptor {
  instanceUrl: string;
  playerToken: string;
}

type Nickname = string;
export interface ServerDescription {
  url: string;
  owner: Nickname;
  capacity: number;
  occupancy: number;
  started: boolean;
}

export default class GameApi {
  private http!: AxiosInstance;

  set httpClient (httpClient: AxiosInstance) {
    this.http = httpClient;
  }

  async newCustom (): Promise<NewGameDescriptor | RejectedResponse> {
    return (await this.http.post<NewGameDescriptor | RejectedResponse>('game/new_custom')).data;
  }

  async listGames (): Promise<ServerDescription[] | RejectedResponse> {
    return (await this.http.get<ServerDescription[] | RejectedResponse>('game/list')).data;
  }
}
