import * as Crypto from 'crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CustomInstanceInfo, SpawnerService } from '@/spawner/spawner.service';
import { LoggerService } from '@/logger/logger.service';
import { PlayerService } from '@/player/player.service';
import {
  ConnectionFailedException,
  RequestInstanceFailedException
} from './game-exception';
import { Player } from '@/player/schemas/player.schema';
import { MatchMakingService } from './matchmaking.service';
import { Participant, PlayerGroup } from './match-making-strategies/match-makin-strategy';
import { QuickGameQueueResponderService } from './quick-game-queue-responder.service';
import { PlayerDescriptor } from './interfaces/player-descriptor';
import { ScenarioService } from '@/scenario/scenario.service';

export interface CustomGameDescriptor {
  instanceUrl: string;
  playerToken: string;
}

export interface ConnectionDescriptor {
  playerToken: string;
}

@Injectable()
export class GameService implements OnModuleInit {
  constructor(
    private readonly spawnerService: SpawnerService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
    private readonly player: PlayerService,
    private readonly matchmaking: MatchMakingService,
    private readonly quickGameQueueResponder: QuickGameQueueResponderService,
    private readonly scenaio: ScenarioService
  ) {
    matchmaking.$gameFormed.subscribe(x => this.newQuick(x));
  }

  async onModuleInit() {
    if (await this.player.resetQuickQueueForAll()) {
      this.logger.log('Reset the quick game queue', 'GameService');
    }
  }

  enterQuickQueue(player: Player) {
    return this.player.enterQuickGameQueue(player.id);
  }

  async leaveQuickQueue(player: Participant) {
    const leaved = await this.player.leaveQuickGameQueue(player.id);

    if (leaved) {
      this.matchmaking.leaveQueue(player);
    }

    return leaved;
  }

  async newQuick(group: PlayerGroup) {
    const instance = await this.spawnerService.findQuickInstance(
      group.map(x => x.playerId),
      await this.scenaio.randomScenarioId());

    if (instance === null) {
      group.forEach(x => this.quickGameQueueResponder.resolve(x.playerId, null));

      return;
    }

    await Promise.all(group.map(x => this.leaveQuickQueue({ id: x.playerId, nickname: x.nickname })));

    group
      .forEach(x => this.quickGameQueueResponder.resolve(x.playerId, {
        instanceUrl: instance.instanceUrl,
        playerToken: this.jwtService.sign(
          {
            instanceId: GameService.instanceIdFromUrl(instance.instanceUrl),
            ...x
          },
          { expiresIn: '3m', secret: instance.spawnerSecret }
        )
      }));
  }

  async newCustom(player: PlayerDescriptor): Promise<CustomGameDescriptor> {
    const acquireId = GameService.generateAcquireId();

    if (
      !(await this.player.linkGame(
        player.playerId,
        { instanceUrl: acquireId },
        acquireId
      ))
    ) {
      this.logger.warn(
        `Unable to request game instance for player '${player.playerId}:${player.nickname}' due already linked to another one`,
        'GameService'
      );

      throw new RequestInstanceFailedException();
    }

    const instance = await this.spawnerService.findCustomInstance(
      player.playerId
    );

    if (instance === null) {
      this.player.unlinkGame(player.playerId);

      this.logger.warn(
        `Unable to request game instance for player '${player.playerId}:${player.nickname}'`,
        'GameService'
      );

      throw new RequestInstanceFailedException();
    }

    if (
      !(await this.player.linkGame(
        player.playerId,
        { instanceUrl: instance.instanceUrl },
        acquireId
      ))
    ) {
      this.logger.warn(
        `Unable to request game instance for player '${player.playerId}:${player.nickname}' due already linked to another one`,
        'GameService'
      );

      throw new RequestInstanceFailedException();
    }

    const playerToken = this.jwtService.sign(
      {
        instanceId: GameService.instanceIdFromUrl(instance.instanceUrl),
        ...player
      },
      { expiresIn: '3m', secret: instance.spawnerSecret }
    );

    return { instanceUrl: instance.instanceUrl, playerToken };
  }

  async connect(
    player: PlayerDescriptor,
    instanceUrl: string
  ): Promise<ConnectionDescriptor> {
    const spawners = await this.spawnerService.listAll();
    const spawnerEntry = GameService.spawnerEntryFromUrl(instanceUrl);
    const spawner = spawners.find(x => x.url === spawnerEntry);

    if (!spawner) {
      this.logger.warn(
        `Unable to find spawner serving game instance '${instanceUrl}'`,
        'GameService'
      );

      throw new ConnectionFailedException();
    }

    const playerToken = this.jwtService.sign(
      { instanceId: GameService.instanceIdFromUrl(instanceUrl), ...player },
      { expiresIn: '3m', secret: spawner.secret }
    );

    return { playerToken };
  }

  async listGames(): Promise<CustomInstanceInfo[]> {
    const ret: CustomInstanceInfo[] = [];

    for (const spawner of await this.spawnerService.listAll()) {
      try {
        ret.push(
          ...(await this.spawnerService.listSpawnerInstancesInfo(
            spawner.url,
            spawner.secret
          ))
        );
      } catch (e) { }
    }

    return ret;
  }

  async cantStartGame(): Promise<boolean> {
    return (await this.spawnerService.listAll()).length > 0;
  }

  static instanceIdFromUrl(instanceUrl: string): string {
    return new URL(instanceUrl).pathname.slice(1);
  }

  static spawnerEntryFromUrl(instanceUrl: string): string {
    return `https://${new URL(instanceUrl).host}`;
  }

  private static generateAcquireId(): string {
    return Crypto.randomBytes(16).toString('hex');
  }
}
