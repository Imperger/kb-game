import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface Headers {
  'content-type': string;
  from: string;
  to: string;
  subject: string;
  'message-id': string;
  'content-transfer-encoding': string;
  date: string;
  'mime-version': string;
}

export interface From {
  address: string;
  name: string;
}

export interface To {
  address: string;
  name: string;
}

export interface From2 {
  address: string;
  args: boolean;
}

export interface To2 {
  address: string;
  args: boolean;
}

export interface Envelope {
  from: From2;
  to: To2[];
  host: string;
  remoteAddress: string;
}

export interface Letter {
  html: string;
  headers: Headers;
  subject: string;
  messageId: string;
  priority: string;
  from: From[];
  to: To[];
  date: Date;
  id: string;
  time: Date;
  read: boolean;
  envelope: Envelope;
  source: string;
  size: number;
  sizeHuman: string;
  attachments?: any;
  calculatedBcc: any[];
}

export class Mailbox {
  private http!: AxiosInstance;
  constructor(entry: string) {
    this.http = axios.create({ baseURL: entry });
  }

  async findByDestination(email: string): Promise<Letter | null> {
    try {
      return (
        (await this.fetchAll()).data.find(x =>
          x.to.some(to => to.address === email)
        ) ?? null
      );
    } catch (e) {
      return null;
    }
  }

  private fetchAll(): Promise<AxiosResponse<Letter[]>> {
    return this.http.get('/email');
  }
}
