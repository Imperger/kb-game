import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { MongoError } from 'mongodb';

import { Spawner } from './schemas/spawner.schema';
import { isAxiosError } from '../common/typeguards/axios-typeguard';
import { RejectedResponseException } from '../common/types/rejected-response';
import { spawnerHostNotFound, spawnerHostNotResponse, spawnerUnknownError, spawnerWrongSecret } from './types/rejected-reason';
import { SpawnerAlreadyAdded } from './exceptions/spawner-already-added';

export interface RequestdSpawnerInfo {
  name: string;
  capacity: number;
}

export interface SpawnerInfo {
  url: string;
  name: string;
  capacity: number;
}

@Injectable()
export class SpawnerService {
  constructor(
    private http: HttpService,
    private readonly jwtService: JwtService,
    @InjectModel(Spawner.name) private readonly spawnerModel: Model<Spawner>) {}

  async add(url: string, secret: string): Promise<RequestdSpawnerInfo> {
    try {
      const info = (await this.http
        .get<RequestdSpawnerInfo>(`${url}/info`, this.useAuthorization(secret))
        .toPromise())
        .data;

      await new this.spawnerModel({ 
        url: url.toLowerCase(), 
        name: info.name,
        capacity: info.capacity,
        secret }).save();

      return info;
    } catch(e) {
      if (isAxiosError(e)) {
        switch(e.code) {
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

  private useAuthorization (secret: string) {
    const token = this.jwtService.sign({ }, { expiresIn: "3m", secret });

    return { headers: { Authorization: `Bearer ${token}` } };
  }
}
