import * as Crypto from 'crypto';
import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import type { AxiosResponse } from 'axios';

import Config from '../config';
import { DockerService } from './docker.service';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, forkJoin, map, Observable, tap } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

export interface CustomGameOptions {
  ownerId: string;
  backendApi: string;
}

export interface QuickGameOptions {
  backendApi: string;
  type: string, // 'FFA' or 'Teams'
  text: string // text content ??
}

export interface SpawnerInfo {
  name: string;
  capacity: number;
}

export interface InstanceRequestResult {
  instanceId: string;
  instanceUrl: string;
};

interface GameInstanceOptions {
  hostname: string;
  instanceId: string;
  owner: string;
  backendApi: string;
  type: 'custom';
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

  private readonly instancesHost = new Set<string>();

  constructor(
    private readonly dockerService: DockerService,
    private readonly http: HttpService,
    private readonly jwtService: JwtService) { }

  async onModuleInit(): Promise<void> {
    await this.prepareGameInstanceImage();
  }

  info(): SpawnerInfo {
    return { name: Config.name, capacity: Config.capacity };
  }

  async createQuickGame(options: QuickGameOptions): Promise<InstanceRequestResult | null> {
    return { instanceId: SpawnerService.generateInstanceId(), instanceUrl: 'wss://game.dev.wsl:3002' }
  }

  async createCustomGame(options: CustomGameOptions): Promise<InstanceRequestResult | null> {
    if (this.instancesHost.size >= Config.capacity) {
      throw new HttpException('The maximum capacity of the spawner has been reached', HttpStatus.CONFLICT);
    }

    const instanceId = SpawnerService.generateInstanceId();

    const instanceHost = this.generateInstanceHostname();

    await this.spawnGameInstance({
      hostname: instanceHost,
      instanceId,
      owner: options.ownerId,
      backendApi: options.backendApi,
      type: 'custom'
    });

    return { instanceId, instanceUrl: `wss://${instanceHost}:3001` }
  }

  async listInstances(): Promise<ServerDescription[]> {
    if (this.instancesHost.size === 0)
      return [];

    const requests = [...this.instancesHost.values()]
      .map(instance => new Observable<ServerDescription>(observer => {
        this.http.get<ServerDescription>(`http://${instance}/info`, this.useAuthorization())
          .pipe<AxiosResponse<ServerDescription>>(catchError(x => Promise.resolve(null)))
          .subscribe(game => {
            if (game)
              observer.next({ ...game.data, url: `${instance}:3001` });

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

  private async spawnGameInstance(options: GameInstanceOptions) {

    const Env = [
      'NODE_EXTRA_CA_CERTS=./ca/root.crt',
      `INSTANCE_ID=${options.instanceId}`,
      `OWNER_ID=${options.owner}`,
      `BACKEND_API=${options.backendApi}`,
      `SPAWNER_API=${Config.entry}`,
      `SPAWNER_SECRET=${Config.secret}`,
      `GAME_TYPE=${options.type}`
    ];

    const Binds = [
      `${Config.tls.ca}:/app/ca:rw`];

    const service = options.hostname.split('.').join('_');

    const Labels = {
      'traefik.enable': 'true',
      [`traefik.http.routers.${service}.rule`]: `Host(\`${options.hostname}\`)`,
      [`traefik.http.services.${service}.loadbalancer.server.port`]: '80',
      [`traefik.http.routers.${service}.entrypoints`]: 'websecure',
      [`traefik.http.routers.${service}.tls`]: 'true'
    };

    const unloaded = this.dockerService.client.run(
      this.gameInstanceImageName,
      [],
      [],
      { name: options.hostname, Labels, HostConfig: { AutoRemove: true, NetworkMode: 'dev', Binds/* , PortBindings */ }, Env }
    );

    this.instancesHost.add(options.hostname);
    unloaded.then(() => this.unloadInstance(options.hostname, options.backendApi));

    let retries = 20;
    for (; retries > 0; --retries) {
      try {
        await this.dockerService.client.getContainer(options.hostname).inspect();
        break;
      } catch (e) {
        await new Promise<void>(ok => setTimeout(() => ok(), 1000));
      }
    }

    for (; retries > 0; --retries) {
      try {
        await firstValueFrom(this.http.get<ServerDescription>(`http://${options.hostname}/info`, this.useAuthorization()));
        break;
      } catch (e) {
        await new Promise<void>(ok => setTimeout(() => ok(), 1000))
      }
    }
  }

  private async unloadInstance(instance: string, backendApi: string) {
    this.instancesHost.delete(instance);

    await firstValueFrom(this.http.post(
      `${backendApi}/api/game/end_custom`,
      { instanceUrl: `wss://${instance}:3001` },
      this.useSpawnerAuthorization()));
  }

  private useAuthorization() {
    const token = this.jwtService.sign({}, {});

    return { headers: { Authorization: `Bearer ${token}` } };
  }

  private useSpawnerAuthorization() {
    const token = this.jwtService.sign({ spawner: Config.entry });

    return { headers: { Authorization: `Bearer ${token}` } };
  }

  private nextHostname: number = 0;
  private generateInstanceHostname() {
    return `game_instance_${this.nextHostname++}.dev.wsl`;
  }

  private static generateInstanceId(): string {
    return Crypto.randomBytes(16).toString('base64');
  }
}
