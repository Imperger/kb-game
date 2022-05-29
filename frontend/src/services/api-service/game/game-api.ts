import { AxiosInstance } from 'axios';
import { RejectedResponse } from '../rejected-response';

export interface NewGameDescriptor {
  instanceUrl: string;
  playerToken: string;
}

export default class GameApi {
  private http!: AxiosInstance;

  set httpClient (httpClient: AxiosInstance) {
    this.http = httpClient;
  }

  async newCustom (): Promise<NewGameDescriptor | RejectedResponse> {
    return (await this.http.post<NewGameDescriptor | RejectedResponse>('game/new_custom')).data;
  }
}
