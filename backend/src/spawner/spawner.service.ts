import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { MongoError } from 'mongodb';
import { firstValueFrom } from 'rxjs';

import { Spawner } from './schemas/spawner.schema';
import { isAxiosError } from '@/common/typeguards/axios-typeguard';
import { SpawnerAlreadyAdded } from './exceptions/spawner-already-added';
import { ConfigHelperService } from '@/config/config-helper.service';
import { HostNotResponseException } from './exceptions/host-not-response.exception';
import { HostNotFoundException } from './exceptions/host-not-found.exception';
import { WrongSecretException } from './exceptions/wrong-secret.exception';
import { UnknownException } from './exceptions/unknown.exception';
import { ListGameFailedException } from './exceptions/list-game-failed.exception';
import { RequestInstanceFailedException } from './exceptions/request-instance-failed.exception';

export interface RequestedSpawnerInfo {
  name: string;
  capacity: number;
}

export interface SpawnerInfo {
  url: string;
  name: string;
  capacity: number;
}

export interface InstanceDescriptor {
  instanceUrl: string;
}

export interface GameInstanceDescriptor {
  instanceUrl: string;
  spawnerUrl: string;
  spawnerSecret: string;
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
export class SpawnerService {
  constructor(
    private http: HttpService,
    private readonly jwtService: JwtService,
    private readonly configHelperService: ConfigHelperService,
    @InjectModel(Spawner.name) private readonly spawnerModel: Model<Spawner>) { }

  async add(url: string, secret: string): Promise<RequestedSpawnerInfo> {
    try {
      const info = (await firstValueFrom(this.http
        .get<RequestedSpawnerInfo>(`${url}/info`, this.useAuthorization(secret))))
        .data;

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
          case 'ERR_BAD_REQUEST':
          {
            if (e.response?.status === HttpStatus.UNAUTHORIZED) {
              throw new WrongSecretException();
            }
          }
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

  async remove(url: string): Promise<boolean> {
    return (await this.spawnerModel.remove({ url })).deletedCount > 0;
  }

  async listAll() {
    return this.spawnerModel.find({});
  }

  async findCustomInstance(ownerId: string): Promise<GameInstanceDescriptor | null> {
    const spawners = await this.listAll();

    for (const s of spawners) {
      try {
        return {
          ...await this.requestCustomInstance(s.url, s.secret, ownerId),
          spawnerUrl: s.url,
          spawnerSecret: s.secret
        };
      } catch (e) { }
    }

    return null;
  }

  async listSpawnerInstancesInfo(spawnerUrl: string, secret: string): Promise<ServerDescription[]> {
    try {
      return (await firstValueFrom(this.http.get<ServerDescription[]>(
        `${spawnerUrl}/game/list`,
        this.useAuthorization(secret)))).data;
    } catch (e) {
      if (isAxiosError(e)) {
        throw new ListGameFailedException();
      }
    }
  }

  private async requestCustomInstance(spawnerUrl: string, secret: string, ownerId: string): Promise<InstanceDescriptor> {
    try {
      return (await firstValueFrom(this.http.post<InstanceDescriptor>(
        `${spawnerUrl}/game/new_custom`,
        { ownerId, backendApi: this.configHelperService.apiEntry },
        this.useAuthorization(secret)))).data;
    } catch (e) {
      if (isAxiosError(e)) {
        throw new RequestInstanceFailedException();
      }
    }
  }

  private useAuthorization(secret: string) {
    const token = this.jwtService.sign({}, { expiresIn: "3m", secret });

    return { headers: { Authorization: `Bearer ${token}` } };
  }
}
