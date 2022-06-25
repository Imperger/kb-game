import { AxiosInstance } from 'axios';
import { isRejectedResponse, RejectedResponse } from '../rejected-response';

export interface Scenario {
  id: string;
  title: string;
  text: string;
}

export interface ScenarioPage {
  total: number;
  scenarios: Scenario[];
}

export default class ScenarioApi {
  private http!: AxiosInstance;

  set httpClient (httpClient: AxiosInstance) {
    this.http = httpClient;
  }

  async add (title: string, text: string): Promise<boolean> {
    return !isRejectedResponse((await this.http.post('scenario/add', { title, text })).data);
  }

  async list (offset: number, limit: number): Promise<ScenarioPage | RejectedResponse> {
    return (await this.http.get<ScenarioPage>(`scenario/list?offset=${offset}&limit=${limit}`)).data;
  }
}
