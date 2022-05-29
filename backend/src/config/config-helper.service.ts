import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigHelperService {
  constructor(private readonly configService: ConfigService) {}

  get apiEntry(): string {
    const ssl = this.configService.get<boolean>('ssl');
    const schema = ssl ? 'https://' : 'http://';
    const domain = this.configService.get<string>('domain');
    const port = this.configService.get<number>('port');
          
    return `${schema}${domain}:${ConfigHelperService.isPortRequired(port, ssl) ? port : ''}`;
  }

  static isPortRequired(port: number, ssl: boolean) {
    return ssl && port !== 443 ||
            !ssl && port !== 80;
  }
}
