import { AxiosInstance } from 'axios';
import { RejectedResponse, isRejectedResponse } from '../rejected-response';
import { CurrentUser } from './types';

export default class UserApi {
  private http!: AxiosInstance;

  set httpClient (httpClient: AxiosInstance) {
    this.http = httpClient;
  }

  async currentUserInfo (): Promise<CurrentUser | RejectedResponse> {
    const response = (await this.http.get<CurrentUser>('user/me')).data;

    if (!isRejectedResponse(response)) {
      response.registeredAt = new Date(response.registeredAt);
      response.scopes.blockedUntil = new Date(response.scopes.blockedUntil);
      response.scopes.mutedUntil = new Date(response.scopes.mutedUntil);
    }

    return response;
  }
}
