import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { DockerService } from "../docker.service";
import { InstanceNameResolverService } from "../instance-name-resolver.service";

import { 
    InstanceRequestResult, 
    InstanceType, 
    QuickGameOptions, 
    SpawnerService } from "../spawner.service";

@Injectable()
export class QuickToDevRedirector extends SpawnerService {
    constructor(configService: ConfigService,
        dockerService: DockerService,
        http: HttpService,
        jwtService: JwtService,
        instanceNameResolver: InstanceNameResolverService) {
        super(configService, dockerService, http, jwtService, instanceNameResolver);
  
        this.instancesHost.set('ga_00000000000000000000000000000000', InstanceType.Custom);
      }
      
    async createQuickGame(options: QuickGameOptions): Promise<InstanceRequestResult | null> {
        return { instanceUrl: 'wss://spawner.dev.wsl:3001/00000000000000000000000000000000' }
    }
}
