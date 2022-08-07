import ms from 'ms';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LinkedGame } from './interfaces/linked-game';
import { Player } from './schemas/player.schema';

@Injectable()
export class PlayerService {
  constructor(
    private readonly config: ConfigService,
    @InjectModel(Player.name) private readonly playerModel: Model<Player>
  ) {}

  async newPlayer(nickname: string): Promise<Player> {
    const freeDiscriminator = await this.playerModel.aggregate([
      {
        $match: { nickname }
      },
      {
        $group: {
          _id: null,
          exists: { $push: '$discriminator' }
        }
      },
      {
        $addFields: {
          free: {
            $first: { $setDifference: [{ $range: [1, 1000] }, '$exists'] }
          }
        }
      },
      {
        $project: { free: 1 }
      }
    ]);

    const discriminator = freeDiscriminator.length
      ? freeDiscriminator[0].free
      : 1;

    const player = new this.playerModel({ nickname, discriminator });
    await player.save();

    return player;
  }

  async linkGame(
    id: string,
    game: LinkedGame,
    acquireId = ''
  ): Promise<boolean> {
    const ttl = ms(this.config.get<string>('game.gamePlayerLinkTtl'));

    return (
      (
        await this.playerModel.updateOne(
          {
            $and: [
              { _id: id },
              {
                $or: [
                  { 'game.instanceUrl': null },
                  { 'game.instanceUrl': acquireId },
                  {
                    $expr: {
                      $lt: [
                        '$game.updatedAt',
                        {
                          $dateSubtract: {
                            startDate: '$$NOW',
                            unit: 'millisecond',
                            amount: ttl
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          },
          { game }
        )
      ).modifiedCount > 0
    );
  }

  async unlinkGame(id: string): Promise<boolean> {
    return (
      (await this.playerModel.updateOne(
        { _id: id },
        [{
          $set: {
            hoursInGame: {
              $sum: [
                '$hoursInGame',
                { $divide: [{ $dateDiff: { startDate: '$game.updatedAt', endDate: '$$NOW', unit: 'second' } }, 3600] }]
            },
            game: null
          }
        }]))
        .modifiedCount > 0
    );
  }

  async unlinkGameAll(instanceUrl: string): Promise<boolean> {
    return (
      (
        await this.playerModel.updateMany(
          { 'game.instanceUrl': instanceUrl },
          [{
            $set: {
              hoursInGame: {
                $sum: [
                  '$hoursInGame',
                  { $divide: [{ $dateDiff: { startDate: '$game.updatedAt', endDate: '$$NOW', unit: 'second' } }, 3600] }]
              },
              game: null
            }
          }]
        )
      ).modifiedCount > 0
    );
  }
}
