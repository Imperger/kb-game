import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { DockerService } from "../docker.service";
import { InstanceNameResolverService } from "../instance-name-resolver.service";

import { 
  CustomGameOptions, 
  InstanceRequestResult, 
  InstanceType, 
  SpawnerService } from "../spawner.service";

@Injectable()
export class CustomToDevRedirector extends SpawnerService {
    constructor(configService: ConfigService,
      dockerService: DockerService,
      http: HttpService,
      jwtService: JwtService,
      instanceNameResolver: InstanceNameResolverService) {
      super(configService, dockerService, http, jwtService, instanceNameResolver);

      this.instancesHost.set('ga_00000000000000000000000000000000', InstanceType.Custom);
    }

    async createCustomGame(options: CustomGameOptions): Promise<InstanceRequestResult | null> {
        return { instanceUrl: 'wss://spawner.dev.wsl:3001/00000000000000000000000000000000' }
    }
}
