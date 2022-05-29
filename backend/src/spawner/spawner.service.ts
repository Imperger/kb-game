import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { MongoError } from 'mongodb';

import { Spawner } from './schemas/spawner.schema';
import { isAxiosError } from '../common/typeguards/axios-typeguard';
import { RejectedResponseException } from '../common/types/rejected-response';
import { spawnerHostNotFound, spawnerHostNotResponse, spawnerRequestInstanceFailed, spawnerUnknownError, spawnerWrongSecret } from './types/rejected-reason';
import { SpawnerAlreadyAdded } from './exceptions/spawner-already-added';
import { ConfigHelperService } from 'src/config/config-helper.service';

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
  instanceId: string;
}

export interface GameInstanceDescriptor {
  instanceUrl: string;
  instanceId: string;
  spawnerSecret: string;
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
      const info = (await this.http
        .get<RequestedSpawnerInfo>(`${url}/info`, this.useAuthorization(secret))
        .toPromise())
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
            throw new RejectedResponseException(spawnerHostNotResponse);
          case 'ENOTFOUND':
            throw new RejectedResponseException(spawnerHostNotFound);
          case 'ERR_BAD_REQUEST':
            throw new RejectedResponseException(spawnerWrongSecret);
          default:
            throw new RejectedResponseException(spawnerUnknownError);
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
          spawnerSecret: s.secret
        };
      } catch (e) { }
    }

    return null;
  }

  private async requestCustomInstance(spawnerUrl: string, secret: string, ownerId: string): Promise<InstanceDescriptor> {
    try {
      return (await this.http.post<InstanceDescriptor>(
        `${spawnerUrl}/game/new_custom`,
        { ownerId, backendApi: this.configHelperService.apiEntry },
        this.useAuthorization(secret)).toPromise()).data;
    } catch (e) {
      if (isAxiosError(e)) {
        throw new RejectedResponseException(spawnerRequestInstanceFailed);
      }
    }
  }

  private useAuthorization(secret: string) {
    const token = this.jwtService.sign({}, { expiresIn: "3m", secret });

    return { headers: { Authorization: `Bearer ${token}` } };
  }
}