import { AxiosInstance } from 'axios';

import { isRejectedResponse, RejectedResponse } from '../rejected-response';
import { ReplaysOverview } from './replay-overview';
import { ReplaySnapshot } from './replay-snapshot';

export enum DateCondition { Greather = '$gt', Less = '$lt' }

export default class ReplayApi {
  private http!: AxiosInstance;

  set httpClient (httpClient: AxiosInstance) {
    this.http = httpClient;
  }

  async getMyReplays (cond: DateCondition, since: Date, limit: number): Promise<ReplaysOverview| RejectedResponse> {
    const overview = (await this.http.get<ReplaysOverview | RejectedResponse>(`replay?cond=${cond}&since=${since.toISOString()}&limit=${limit}`)).data;

    return isRejectedResponse(overview)
      ? overview
      : { total: overview.total, replays: overview.replays.map(x => ({ ...x, createdAt: new Date(x.createdAt) })) };
  }

  async getReplay (id: string): Promise<ReplaySnapshot | RejectedResponse> {
    const replay = (await this.http.get<ReplaySnapshot | RejectedResponse>(`replay/${id}`)).data;

    return isRejectedResponse(replay)
      ? replay
      : { ...replay, createdAt: new Date(replay.createdAt) };
  }
}
