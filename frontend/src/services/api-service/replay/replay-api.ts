import { AxiosInstance } from 'axios';
import { isRejectedResponse, RejectedResponse } from '../rejected-response';
import { ReplayOverview } from './replay-overview';

export default class ReplayApi {
  private http!: AxiosInstance;

  set httpClient (httpClient: AxiosInstance) {
    this.http = httpClient;
  }

  async getMyReplays (since: Date, limit: number): Promise<ReplayOverview[] | RejectedResponse> {
    const replays = (await this.http.get<ReplayOverview[] | RejectedResponse>(`replay?since=${since.toISOString()}&limit=${limit}`)).data;

    return isRejectedResponse(replays)
      ? replays
      : replays.map(x => ({ ...x, createdAt: new Date(x.createdAt) }));
  }
}
