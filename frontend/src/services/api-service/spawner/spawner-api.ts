import { AxiosInstance } from 'axios';

import { RejectedResponse } from '../rejected-response';

export interface RequestedSpawnerInfo {
  name: string;
  capacity: number;
}

export interface SpawnerInfo {
  url: string;
  name: string;
  capacity: number;
}

export class SpawnerApi {
  private http!: AxiosInstance;

  set httpClient (httpClient: AxiosInstance) {
    this.http = httpClient;
  }

  async add (url: string, secret: string): Promise<RequestedSpawnerInfo | RejectedResponse> {
    return (await this.http.post<RequestedSpawnerInfo>('spawner', { url, secret })).data;
  }

  async remove (url: string): Promise<boolean | RejectedResponse> {
    return (await this.http.delete(`spawner/${btoa(url)}`)).data;
  }

  async listAll (): Promise<SpawnerInfo[]> {
    return (await this.http.get<SpawnerInfo[]>('spawner')).data;
  }
}
