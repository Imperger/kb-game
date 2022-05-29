import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Player } from './schemas/player.schema';

@Injectable()
export class PlayerService {
  constructor(@InjectModel(Player.name) private readonly playerModel: Model<Player>) {}

  async newPlayer(nickname: string): Promise<Player> {
    const freeDiscriminator = await this.playerModel.aggregate([
      {
        $match: { nickname }
      },
      { 
        $group: { 
          _id: null, 
          exists: { $push: "$discriminator" } 
        }
      },
      { 
        $addFields: { 
          free: { $first: { $setDifference: [ { $range: [ 1, 1000 ] }, "$exists" ] }}
        }
      },
      {
        $project: { "free": 1 }
      }
    ]);

    const discriminator = freeDiscriminator.length
      ? freeDiscriminator[0].free
      : 1;

    const player = new this.playerModel({ nickname, discriminator });
    await player.save();
    
    return player;
  }
}
