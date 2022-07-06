import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ServerDescription, SpawnerService } from '@/spawner/spawner.service';
import { ConnectionFailedException } from './exceptions/connection-failed.exception';
import { RequestInstanceFailedException } from './exceptions/request-instance-failed.exception';
import { LoggerService } from '@/logger/logger.service';

export interface CustomGameDescriptor {
  instanceUrl: string;
  playerToken: string;
}

export interface ConnectionDescriptor {
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
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService) { }

  async newCustom(player: PlayerDescriptor): Promise<CustomGameDescriptor | null> {
    const instance = await this.spawnerService.findCustomInstance(player.playerId);

    if (instance === null) {
      this.logger.warn(`Unable to request game instance for player '${player.playerId}:${player.nickname}'`, 'GameService');

      throw new RequestInstanceFailedException();
    }

    const playerToken = this.jwtService.sign(
      { instanceId: GameService.instanceIdFromUrl(instance.instanceUrl), ...player },
      { expiresIn: "3m", secret: instance.spawnerSecret });

    return { instanceUrl: instance.instanceUrl, playerToken };
  }

  async connect(player: PlayerDescriptor, instanceUrl: string): Promise<ConnectionDescriptor> {

    const spawners = await this.spawnerService.listAll();
    const spawnerEntry = GameService.spawnerEntryFromUrl(instanceUrl);
    const spawner = spawners.find(x => x.url === spawnerEntry);

    if (!spawner) {
      this.logger.warn(`Unable to find spawner serving game instance '${instanceUrl}'`, 'GameService');

      throw new ConnectionFailedException();
    }

    const playerToken = this.jwtService.sign(
      { instanceId: GameService.instanceIdFromUrl(instanceUrl), ...player },
      { expiresIn: "3m", secret: spawner.secret });

    return { playerToken };

  }

  async listGames(): Promise<ServerDescription[]> {
    const ret: ServerDescription[] = [];

    for (const spawner of await this.spawnerService.listAll()) {
      try {
        ret.push(...await this.spawnerService.listSpawnerInstancesInfo(spawner.url, spawner.secret));
      } catch (e) {
      }
    }

    return ret;
  }

  static instanceIdFromUrl(instanceUrl: string): string {
    return new URL(instanceUrl).pathname.slice(1);
  }

  static spawnerEntryFromUrl(instanceUrl: string): string {
    return `https://${new URL(instanceUrl).host}`;
  }
}
