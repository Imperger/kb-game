import * as Crypto from 'crypto';
import { Injectable } from '@nestjs/common';

import Config from '../config';

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

@Injectable()
export class SpawnerService {
  private network: string = '';

  info(): SpawnerInfo {
    return { name: Config.name, capacity: Config.capacity };
  }

  async createQuickGame(options: QuickGameOptions): Promise<InstanceRequestResult | null> {
    return { instanceId: SpawnerService.generateInstanceId(), instanceUrl: 'https://game' }
  }

  async createCustomGame(options: CustomGameOptions): Promise<InstanceRequestResult | null> {
    return { instanceId: SpawnerService.generateInstanceId(), instanceUrl: 'https://game' }
  }

  private static generateInstanceId(): string {
    return Crypto.randomBytes(16).toString('base64');
  }
}
