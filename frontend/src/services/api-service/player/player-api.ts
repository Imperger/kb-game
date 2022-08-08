import { AxiosInstance } from 'axios';
import { RejectedResponse } from '../rejected-response';
import { PlayerStats } from './player-stats';

export default class PlayerApi {
  private http!: AxiosInstance;

  set httpClient (httpClient: AxiosInstance) {
    this.http = httpClient;
  }

  async getPlayerInfo (nickname: string): Promise<PlayerStats | RejectedResponse> {
    return (await this.http.get<PlayerStats | RejectedResponse>(`player/${nickname}`)).data;
  }

  async currentPlayerInfo (): Promise<PlayerStats | RejectedResponse> {
    return (await this.http.get<PlayerStats | RejectedResponse>('player/me')).data;
  }
}
