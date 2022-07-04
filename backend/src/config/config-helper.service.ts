import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigHelperService {
  constructor(private readonly configService: ConfigService) {}

  get apiEntry(): string {
    return `https://${this.configService.get<string>('hostname')}`;
  }

  static isPortRequired(port: number, ssl: boolean) {
    return ssl && port !== 443 ||
            !ssl && port !== 80;
  }
}
