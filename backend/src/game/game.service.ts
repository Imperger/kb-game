import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerDescription, SpawnerService } from '../spawner/spawner.service';
import { ConnectionFailedException } from './exceptions/connection-failed.exception';
import { Game } from './schemas/game.schema';

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
    @InjectModel(Game.name) private readonly gameModel: Model<Game>) { }

  async newCustom(player: PlayerDescriptor): Promise<CustomGameDescriptor | null> {
    const instance = await this.spawnerService.findCustomInstance(player.playerId);

    if (instance === null) {
      return null;
    }

    await new this.gameModel({
      instanceUrl: instance.instanceUrl,
      instanceId: instance.instanceId,
      spawnerUrl: instance.spawnerUrl
    }).save();

    const playerToken = this.jwtService.sign(
      { instanceId: instance.instanceId, ...player },
      { expiresIn: "3m", secret: instance.spawnerSecret });

    return { instanceUrl: instance.instanceUrl, playerToken };
  }

  async connect(player: PlayerDescriptor, instanceUrl: string): Promise<ConnectionDescriptor> {
    const game = await this.gameModel.findOne({ instanceUrl });

    if (game === null) {
      throw new ConnectionFailedException();
    }

    const spawners = await this.spawnerService.listAll();
    const spawner = spawners.find(x => x.url === game.spawnerUrl);

    if (!spawner)
      throw new ConnectionFailedException();

    const playerToken = this.jwtService.sign(
      { instanceId: game.instanceId, ...player },
      { expiresIn: "3m", secret: spawner.secret });

    return { playerToken };

  }

  async endCustom(instanceUrl: string): Promise<boolean> {
    return (await this.gameModel.deleteOne({ instanceUrl })).deletedCount > 0;
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
}
