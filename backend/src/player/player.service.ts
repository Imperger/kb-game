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
  ) { }

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

  async enterQuickGameQueue(id: string): Promise<boolean> {
    return (await this.playerModel.updateOne(
      { _id: id, quickGameQueue: null, game: null },
      { $currentDate: { quickGameQueue: true } })).modifiedCount > 0;
  }

  async leaveQuickGameQueue(id: string): Promise<boolean> {
    return (await this.playerModel.updateOne(
      { _id: id, quickGameQueue: { $ne: null } },
      { $set: { quickGameQueue: null } })).modifiedCount > 0;
  }

  async resetQuickQueueForAll(): Promise<boolean> {
    return (await this.playerModel.updateMany(
      { quickGameQueue: { $ne: null } },
      { $set: { quickGameQueue: null } }
    )).acknowledged;
  }

  /**
   * 
   * @param id Player id
   * @param game Reference to the game instance
   * @param acquireId Used for linking without previous unlinking
   * @returns Returns true if the linking was successful, false - otherwise
   * Link the player to the game instance to which he's connected to. Using acquiredId
   * makes possible to make prelink and thus reserve the player by itself in case
   * when an reference to a game instance unknown yet. It is also impossible to link
   * a player who is in the quick game queue.
   */
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
              { _id: id, quickGameQueue: null },
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

  get model() {
    return this.playerModel;
  }
}
