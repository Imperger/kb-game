import { AxiosInstance } from 'axios';
import { RejectedResponse } from '../rejected-response';
import { CurrentUser } from './types';

export default class UserApi {
    private http!: AxiosInstance;

    set httpClient (httpClient: AxiosInstance) {
      this.http = httpClient;
    }

    async currentUserInfo (): Promise<CurrentUser | RejectedResponse> {
      return (await this.http.get('user/me')).data;
    }
}
