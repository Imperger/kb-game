import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ServerDescription, SpawnerService } from 'src/spawner/spawner.service';

export interface CustomGameDescriptor {
  instanceUrl: string;
  playerToken: string;
}

export interface PlayerDescriptor {
  playerId: string;
  nickname: string;
}

@Injectable()
export class GameService {
  constructor(
    private readonly spawnerService: SpawnerService,
    private readonly jwtService: JwtService) { }

  async newCustom(player: PlayerDescriptor): Promise<CustomGameDescriptor | null> {
    const instance = await this.spawnerService.findCustomInstance(player.playerId);

    if (instance === null) {
      return null;
    }

    const playerToken = this.jwtService.sign(
      { instanceId: instance.instanceId, ...player },
      { expiresIn: "3m", secret: instance.spawnerSecret });

    return { instanceUrl: instance.instanceUrl, playerToken };
  }

  async listGames(): Promise<ServerDescription[]> {
    const ret: ServerDescription[] = [];

    for(const spawner of await this.spawnerService.listAll()) {
      try {
        ret.push(...await this.spawnerService.listSpawnerInstancesInfo(spawner.url, spawner.secret));
      } catch(e) {
      }
    }

    return ret;
  }
}
