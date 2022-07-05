import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class InstanceNameResolverService {
    private readonly prefix = 'ga_';

    constructor(private readonly configService: ConfigService) {}

    toHostname(instanceId: string): string {
        return this.prefix + instanceId;
    }

    toInstanceId(hostname: string): string {
        return hostname.slice(this.prefix.length);
    }

    buildInstanceUrl(instanceId: string): string {
        return `wss://${this.configService.get<string>('hostname')}:${this.configService.get<number>('port')}/${instanceId}`;
      }
}
