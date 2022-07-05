import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigHelperService {
  constructor(private readonly configService: ConfigService) {}

  get apiEntry(): string {
    return `https://${this.configService.get<string>('hostname')}`;
  }
}
