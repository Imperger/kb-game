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
  cursorNext: string;
  cursorPrev: string;
}

export type ScenarioContent = Omit<Scenario, 'id'>;

export type ScenarioContentUpdate = PartialProps<Scenario, 'title' | 'text'>;

export type ScenarioCreate = Omit<Scenario, 'title' | 'text'>;

export enum SearchQueryOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export enum SearchQuerySort {
  Title = 'title',
  Length = 'length'
}

export interface SearchQuery {
  query?: string;
  sortBy: SearchQuerySort;
  orderBy: SearchQueryOrder;
  limit: number;
  /**
   * Consists of a unique scenario id +
   * the edge value of the field by which sorting occurs.
   * Values are separated by '|', example: 642be6438a45da9476f9b6f0|10.
   * The result string representation encoded using base64
   */
  cursorNext?: string;
  cursorPrev?: string;
}

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

  async list (query: SearchQuery): Promise<ScenarioPage | RejectedResponse> {
    let q = '';

    if (query.query) {
      q += `query=${query.query}&`;
    }

    q += `sort=${query.sortBy}&order=${query.orderBy}&limit=${query.limit}`;

    if (query.cursorNext) {
      q += `&cursorNext=${query.cursorNext}`;
    } else if (query.cursorPrev) {
      q += `&cursorPrev=${query.cursorPrev}`;
    }
    return (await this.http.get<ScenarioPage>(`scenario?${q}`)).data;
  }
}
