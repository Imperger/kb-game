import * as Crypto from 'crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';

import Config from '../config';
import { DockerService } from './docker.service';

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
  host: string;
  port: number;
  instanceId: string;
  owner: string;
  backendApi: string;
  type: 'custom';
}

@Injectable()
export class SpawnerService implements OnModuleInit {
  private network: string = '';

  private readonly gameInstanceImageName = 'game_instance';

  constructor(private readonly dockerService: DockerService) { }

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
    const instanceId = SpawnerService.generateInstanceId();

    const instanceHost = this.generateInstanceHostname();
    const instancePort = this.devPortHack;

    await this.spawnGameInstance({
      host: instanceHost,
      port: instancePort,
      instanceId,
      owner: options.ownerId,
      backendApi: options.backendApi,
      type: 'custom'
    });

    return { instanceId, instanceUrl: `wss://${instanceHost}:${instancePort}` }
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
      '/home/vitaly/Projects/kb-game/certs:/app/certs:rw',
      '/home/vitaly/Projects/kb-game/ca:/app/ca:rw'];

    const ExposedPorts = { "3002/tcp": {} };
    const PortBindings = { '3002/tcp': [{ 'HostPort': `${options.port}` }] };

    const ret = this.dockerService.client.run(
      this.gameInstanceImageName,
      [],
      [],
      { name: options.host, ExposedPorts, HostConfig: { AutoRemove: true, NetworkMode: 'dev', Binds, PortBindings }, Env }
    );

    for(let retries = 0; retries < 5; ++retries) {
      try {
        await this.dockerService.client.getContainer(options.host).inspect();
        return;
      }catch(e) {
        await new Promise<void>(ok => setTimeout(() => ok(), 1000))
      }
    }
  }

  private nextHostname: number = 0;
  private generateInstanceHostname() {
    return `game_instance_${this.nextHostname++}.dev.wsl`;
  }

  private port = 3100;
  private get devPortHack() {
    const port = this.port;

    this.port = this.port >= 3999 ? 0 : this.port + 1;

    return port;
  }

  private static generateInstanceId(): string {
    return Crypto.randomBytes(16).toString('base64');
  }
}
