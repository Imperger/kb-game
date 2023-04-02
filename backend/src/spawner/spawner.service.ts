import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { MongoError } from 'mongodb';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';

import { Spawner } from './schemas/spawner.schema';
import {
  HostNotFoundException,
  HostNotResponseException,
  ListGameFailedException,
  RequestInstanceFailedException,
  SpawnerAlreadyAdded,
  SpawnerNotFound,
  UnknownException,
  WrongSecretException
} from './spawner-exception';

import { isAxiosError } from '@/common/typeguards/axios-typeguard';
import { ConfigHelperService } from '@/config/config-helper.service';

export interface KnownSpawnerInfo {
  name: string;
  capacity: number;
}

export interface SpawnerInfo {
  url: string;
  name: string;
  capacity: number;
}

export interface InstanceLocation {
  instanceUrl: string;
}

export interface RequestedInstance {
  instanceUrl: string;
  spawnerUrl: string;
  spawnerSecret: string;
}

export interface CustomInstanceInfo {
  url: string;
  owner: string;
  capacity: number;
  occupancy: number;
  started: boolean;
}

@Injectable()
export class SpawnerService {
  constructor(
    private http: HttpService,
    private readonly jwtService: JwtService,
    private readonly configHelperService: ConfigHelperService,
    @InjectModel(Spawner.name) private readonly spawnerModel: Model<Spawner>
  ) {}

  async add(url: string, secret: string): Promise<KnownSpawnerInfo> {
    try {
      const info = (
        await firstValueFrom(
          this.http.get<KnownSpawnerInfo>(
            `${url}/info`,
            this.useAuthorization(secret)
          )
        )
      ).data;

      await new this.spawnerModel({
        url: url.toLowerCase(),
        name: info.name,
        capacity: info.capacity,
        secret
      }).save();

      return info;
    } catch (e) {
      if (isAxiosError(e)) {
        switch (e.code) {
          case 'ECONNREFUSED':
            throw new HostNotResponseException();
          case 'ENOTFOUND':
            throw new HostNotFoundException();
          case 'ERR_BAD_REQUEST': {
            if (e.response?.status === HttpStatus.UNAUTHORIZED) {
              throw new WrongSecretException();
            }
          }
          // eslint-disable-next-line no-fallthrough
          default:
            throw new UnknownException();
        }
      } else if (e instanceof MongoError) {
        if (e.code === 11000) {
          throw new SpawnerAlreadyAdded();
        }
      }
    }
  }

  async remove(url: string): Promise<void> {
    if ((await this.spawnerModel.deleteOne({ url })).deletedCount === 0) {
      throw new SpawnerNotFound();
    }
  }

  async listAll() {
    return this.spawnerModel.find({});
  }

  async findCustomInstance(ownerId: string): Promise<RequestedInstance | null> {
    const spawners = await this.listAll();

    for (const s of spawners) {
      try {
        return {
          ...(await this.requestCustomInstance(s.url, s.secret, ownerId)),
          spawnerUrl: s.url,
          spawnerSecret: s.secret
        };
      } catch (e) {
        // Failed to request a custom instance
      }
    }

    return null;
  }

  async findQuickInstance(
    players: string[],
    scenarioId: string
  ): Promise<RequestedInstance | null> {
    const spawners = await this.listAll();

    for (const s of spawners) {
      try {
        return {
          ...(await this.requestQuickInstance(
            s.url,
            s.secret,
            players,
            scenarioId
          )),
          spawnerUrl: s.url,
          spawnerSecret: s.secret
        };
      } catch (e) {
        // Failed to rerquest quick instance
      }
    }

    return null;
  }

  async listSpawnerInstancesInfo(
    spawnerUrl: string,
    secret: string
  ): Promise<CustomInstanceInfo[]> {
    try {
      return (
        await firstValueFrom(
          this.http.get<CustomInstanceInfo[]>(
            `${spawnerUrl}/game/list`,
            this.useAuthorization(secret)
          )
        )
      ).data;
    } catch (e) {
      if (isAxiosError(e)) {
        throw new ListGameFailedException();
      }
    }
  }

  private async requestCustomInstance(
    spawnerUrl: string,
    secret: string,
    ownerId: string
  ): Promise<InstanceLocation> {
    try {
      return (
        await firstValueFrom(
          this.http.post<InstanceLocation>(
            `${spawnerUrl}/game/new_custom`,
            { ownerId, backendApi: this.configHelperService.apiEntry },
            this.useAuthorization(secret)
          )
        )
      ).data;
    } catch (e) {
      if (isAxiosError(e)) {
        throw new RequestInstanceFailedException();
      }
    }
  }

  private async requestQuickInstance(
    spawnerUrl: string,
    secret: string,
    players: string[],
    scenarioId: string
  ): Promise<InstanceLocation> {
    try {
      return (
        await firstValueFrom(
          this.http.post<InstanceLocation>(
            `${spawnerUrl}/game/new_quick`,
            {
              players,
              scenarioId,
              backendApi: this.configHelperService.apiEntry
            },
            this.useAuthorization(secret)
          )
        )
      ).data;
    } catch (e) {
      if (isAxiosError(e)) {
        throw new RequestInstanceFailedException();
      }
    }
  }

  private useAuthorization(secret: string) {
    const token = this.jwtService.sign({}, { expiresIn: '3m', secret });

    return { headers: { Authorization: `Bearer ${token}` } };
  }
}
