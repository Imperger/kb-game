import ms from 'ms';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LinkedGame } from './interfaces/linked-game';
import { Player } from './schemas/player.schema';
import { ReplayStats } from '@/replay/interfaces/replay-stats';
import { EloCalculatorService } from '@/scoring/elo-calculator.service';

@Injectable()
export class PlayerService {
  constructor(
    private readonly config: ConfigService,
    @InjectModel(Player.name) private readonly player: Model<Player>,
    private readonly elo: EloCalculatorService
  ) { }

  async newPlayer(nickname: string): Promise<Player> {
    const freeDiscriminator = await this.player.aggregate([
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

    const player = new this.player({ nickname, discriminator });
    await player.save();

    return player;
  }

  async enterQuickGameQueue(id: string): Promise<boolean> {
    return (await this.player.updateOne(
      { _id: id, quickGameQueue: null, game: null },
      { $currentDate: { quickGameQueue: true } })).modifiedCount > 0;
  }

  async leaveQuickGameQueue(id: string): Promise<boolean> {
    return (await this.player.updateOne(
      { _id: id, quickGameQueue: { $ne: null } },
      { $set: { quickGameQueue: null } })).modifiedCount > 0;
  }

  async resetQuickQueueForAll(): Promise<boolean> {
    return (await this.player.updateMany(
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
        await this.player.updateOne(
          {
            $and: [
              { _id: id, quickGameQueue: null },
              {
                $or: [
                  { 'game': null },
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
      (await this.player.updateOne(
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
        await this.player.updateMany(
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

  async updateStats(stats: ReplayStats[]): Promise<boolean> {
    if (stats.length < 2) {
      return;
    }

    const participants = await this.player.find({ _id: { $in: stats.map(x => x.playerId) } });
    
    const updatedElo = this.elo
      .newRating(stats.map(x => participants.find(p => p.id === x.playerId).elo));

    return (await this.player.bulkWrite(participants.map(p => {
      const statsIdx = stats.findIndex(x => x.playerId === p.id);
      const s = stats[statsIdx];
      const elo = updatedElo[statsIdx];

      return {
        updateOne: {
          filter: { _id: p.id },
          update: { 
            $inc: { 
              totalPlayed: 1, 
              totalWins: +(stats[0].playerId === p.id) },
            $set: { 
              averageCpm: Math.round((p.averageCpm * p.totalPlayed + s.cpm) / (p.totalPlayed + 1)),
              elo },
            $max: { maxCpm: Math.round(s.cpm) }
          }
        }
      };}))).modifiedCount === stats.length;
  }

  get model() {
    return this.player;
  }
}
