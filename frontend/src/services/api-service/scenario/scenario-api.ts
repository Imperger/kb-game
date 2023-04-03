import { PartialProps } from '@/util/type/partial-props';
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

export type ScenarioContent = Omit<Scenario, 'id'>;

export type ScenarioContentUpdate = PartialProps<Scenario, 'title' | 'text'>;

export type ScenarioCreate = Omit<Scenario, 'title' | 'text'>;

export default class ScenarioApi {
  private http!: AxiosInstance;

  set httpClient (httpClient: AxiosInstance) {
    this.http = httpClient;
  }

  async add ({ title, text }: ScenarioContent): Promise<ScenarioCreate | RejectedResponse> {
    return (await this.http.post('scenario', { title, text })).data;
  }

  async update ({ id, ...content }: ScenarioContentUpdate): Promise<boolean> {
    return !isRejectedResponse((await this.http.put<boolean>(`scenario/${id}`, { ...content })));
  }

  async remove (id: string): Promise<void | RejectedResponse> {
    return (await this.http.delete<void>(`scenario/${id}`)).data;
  }

  async content (id: string): Promise<ScenarioContent | RejectedResponse> {
    return (await this.http.get<ScenarioContent>(`scenario/${id}`)).data;
  }

  async list (offset: number, limit: number): Promise<ScenarioPage | RejectedResponse> {
    return (await this.http.get<ScenarioPage>(`scenario?offset=${offset}&limit=${limit}`)).data;
  }
}
