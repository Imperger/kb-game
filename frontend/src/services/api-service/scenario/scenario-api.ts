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

export interface ScenarioContent {
  title: string;
  text: string;
}

export default class ScenarioApi {
  private http!: AxiosInstance;

  set httpClient (httpClient: AxiosInstance) {
    this.http = httpClient;
  }

  async add (title: string, text: string): Promise<boolean> {
    return !isRejectedResponse((await this.http.post('scenario', { title, text })).data);
  }

  async update (id: string, content: ScenarioContent): Promise<boolean> {
    return !isRejectedResponse((await this.http.put<boolean>(`scenario/${id}`, { ...content })));
  }

  async remove (id: string): Promise<boolean | RejectedResponse> {
    return (await this.http.delete<boolean>(`scenario/${id}`)).data;
  }

  async content (id: string): Promise<ScenarioContent | RejectedResponse> {
    return (await this.http.get<ScenarioContent>(`scenario/${id}`)).data;
  }

  async list (offset: number, limit: number): Promise<ScenarioPage | RejectedResponse> {
    return (await this.http.get<ScenarioPage>(`scenario?offset=${offset}&limit=${limit}`)).data;
  }
}
