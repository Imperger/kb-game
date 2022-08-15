import * as Crypto from 'crypto';
import { ConflictException, HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import type { AxiosResponse } from 'axios';

import { DockerService } from './docker.service';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, forkJoin, map, Observable, tap } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InstanceNameResolverService } from './instance-name-resolver.service';

export interface CustomGameOptions {
  ownerId: string;
  backendApi: string;
}

type PlayerId = string;

export interface QuickGameOptions {
  players: PlayerId[];
  scenarioId: string;
  backendApi: string;
}

export interface SpawnerInfo {
  name: string;
  capacity: number;
}

export interface InstanceRequestResult {
  instanceUrl: string;
};

enum InstanceType { Custom = 'custom', Quick = 'quick' }

interface CustomGameInstanceOptions {
  instanceId: string;
  owner: string;
  backendApi: string;
  type: InstanceType.Custom;
}

interface QuickGameInstanceOptions {
  instanceId: string;
  players: PlayerId[];
  scenarioId: string;
  backendApi: string;
  type: InstanceType.Quick;
}

type GameInstanceOptions = CustomGameInstanceOptions | QuickGameInstanceOptions;

function isCustomGameInstanceOptions(opts: GameInstanceOptions): opts is CustomGameInstanceOptions {
  return opts.type === InstanceType.Custom;
}

function isQuickGameInstanceOptions(opts: GameInstanceOptions): opts is QuickGameInstanceOptions {
  return opts.type === InstanceType.Quick;
}

type Nickname = string;
export interface ServerDescription {
  url: string;
  owner: Nickname;
  capacity: number;
  occupancy: number;
  started: boolean;
}


@Injectable()
export class SpawnerService implements OnModuleInit {
  private network: string = '';

  private readonly gameInstanceImageName = 'game_instance';

  private readonly instancesHost = new Map<string, InstanceType>();

  constructor(
    private readonly configService: ConfigService,
    private readonly dockerService: DockerService,
    private readonly http: HttpService,
    private readonly jwtService: JwtService,
    private readonly instanceNameResolver: InstanceNameResolverService) { }

  async onModuleInit(): Promise<void> {
    await this.prepareGameInstanceImage();
  }

  info(): SpawnerInfo {
    return {
      name: this.configService.get<string>('name'),
      capacity: this.configService.get<number>('capacity')
    };
  }

  async createQuickGame(options: QuickGameOptions): Promise<InstanceRequestResult | null> {
    if (this.instancesHost.size >= this.configService.get<number>('capacity')) {
      throw new HttpException('The maximum capacity of the spawner has been reached', HttpStatus.CONFLICT);
    }

    const instanceId = SpawnerService.generateInstanceId();

    if (!await this.spawnGameInstance({
      instanceId,
      players: options.players,
      scenarioId: options.scenarioId,
      backendApi: options.backendApi,
      type: InstanceType.Quick
    })) {
      throw new ConflictException('Failed to spawn game instance');
    }

    return { instanceUrl: this.instanceNameResolver.buildInstanceUrl(instanceId) }
  }

  async createCustomGame(options: CustomGameOptions): Promise<InstanceRequestResult> {
    if (this.instancesHost.size >= this.configService.get<number>('capacity')) {
      throw new HttpException('The maximum capacity of the spawner has been reached', HttpStatus.CONFLICT);
    }

    const instanceId = SpawnerService.generateInstanceId();

    if (!await this.spawnGameInstance({
      instanceId,
      owner: options.ownerId,
      backendApi: options.backendApi,
      type: InstanceType.Custom
    })) {
      throw new ConflictException('Failed to spawn game instance');
    }

    return { instanceUrl: this.instanceNameResolver.buildInstanceUrl(instanceId) }
  }

  async listInstances(): Promise<ServerDescription[]> {
    if (this.instancesHost.size === 0)
      return [];

    const requests = [...this.instancesHost.entries()]
      .filter(([host, type]) => type === InstanceType.Custom)
      .map(([host, type]) => new Observable<ServerDescription>(observer => {
        this.http.get<ServerDescription>(`http://${host}/info`, this.useAuthorization())
          .pipe<AxiosResponse<ServerDescription>>(catchError(x => Promise.resolve(null)))
          .subscribe(game => {
            if (game)
              observer.next({
                ...game.data,
                url: this.instanceNameResolver.buildInstanceUrl(this.instanceNameResolver.toInstanceId(host))
              });

            observer.complete();
          });
      }));

    return (await firstValueFrom(forkJoin(requests))).filter(x => x !== null);
  }

  private async prepareGameInstanceImage(): Promise<void> {
    try {
      await this.dockerService.client.getImage(this.gameInstanceImageName).inspect();
    } catch (e) {
      const stream = await this.dockerService.client.buildImage(
        { context: '../game_instance', src: ['.'] },
        { t: this.gameInstanceImageName });

      await new Promise<void>((resolve, reject) => {
        this.dockerService.client.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve())
      });

      await this.dockerService.client.getImage(this.gameInstanceImageName).inspect();
    }
  }

  private async spawnGameInstance(options: CustomGameInstanceOptions | QuickGameInstanceOptions): Promise<boolean> {

    const Env = [
      'NODE_EXTRA_CA_CERTS=./ca/root.crt',
      `INSTANCE_ID=${options.instanceId}`,
      `BACKEND_API=${options.backendApi}`,
      `SPAWNER_API=${this.configService.get<string>('entry')}`,
      `SPAWNER_SECRET=${this.configService.get<string>('secret')}`,
      `GAME_TYPE=${options.type}`
    ];

    if (isCustomGameInstanceOptions(options)) {
      Env.push(`OWNER_ID=${options.owner}`);
    } else if (isQuickGameInstanceOptions(options)) {
      Env.push(`PLAYERS=${JSON.stringify(options.players)}`);
      Env.push(`SCENARIO_ID=${options.scenarioId}`);
    }

    const Binds = [
      `${this.configService.get<string>('game_instance.ca_mount')}:/app/ca:rw`];

    const hostname = this.instanceNameResolver.toHostname(options.instanceId);

    const Labels = {
      'traefik.enable': 'true',
      [`traefik.http.routers.${hostname}.rule`]: `PathPrefix(\`/${options.instanceId}\`)`,
      [`traefik.http.routers.${hostname}.middlewares`]: `${hostname}-strip-prefix`,
      [`traefik.http.middlewares.${hostname}-strip-prefix.stripprefix.prefixes`]: `/${options.instanceId}`,
      [`traefik.http.services.${hostname}.loadbalancer.server.port`]: '80',
      [`traefik.http.routers.${hostname}.entrypoints`]: 'websecure',
      [`traefik.http.routers.${hostname}.tls`]: 'true'
    };

    const unloaded = this.dockerService.client.run(
      this.gameInstanceImageName,
      [],
      [],
      {
        name: hostname,
        Labels,
        HostConfig: { AutoRemove: true, NetworkMode: this.configService.get<string>('network'), Binds },
        Env
      }
    );

    this.instancesHost.set(hostname, options.type);

    let retries = 20;

    unloaded.then(() => {
      retries = 0;
      this.instancesHost.delete(hostname);
    });

    for (; retries > 0; --retries) {
      try {
        await this.dockerService.client.getContainer(hostname).inspect();
        break;
      } catch (e) {
        await new Promise<void>(ok => setTimeout(() => ok(), 1000));
      }
    }

    for (; retries > 0; --retries) {
      try {
        await firstValueFrom(this.http.get<ServerDescription>(`http://${hostname}/info`, this.useAuthorization()));
        break;
      } catch (e) {
        await new Promise<void>(ok => setTimeout(() => ok(), 1000))
      }
    }

    return retries > 0;
  }

  private useAuthorization() {
    const token = this.jwtService.sign({}, {});

    return { headers: { Authorization: `Bearer ${token}` } };
  }

  private useSpawnerAuthorization() {
    const token = this.jwtService.sign({ spawner: this.configService.get<string>('entry') });

    return { headers: { Authorization: `Bearer ${token}` } };
  }

  private static generateInstanceId(): string {
    return Crypto.randomBytes(16).toString('hex');
  }
}
