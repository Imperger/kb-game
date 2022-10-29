import mongoose from 'mongoose';
import { Model } from 'mongoose';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ReplayDto } from './dto/replay-dto';
import { InputEvent, Replay, Track } from './schemas/replay.schema';
import { PlayerService } from '@/player/player.service';
import { StatsGathererService } from './stats-gatherer.service';
import { ReplayStats } from './interfaces/replay-stats';
import { Seconds } from '@/common/duration';
import { ReplaysOverview } from './interfaces/replay-overview';
import { ReplaySnapshot } from './interfaces/replay-snapshot';

export enum DateCondition { Greather = '$gt', Less = '$lt' };

@Injectable()
export class ReplayService {
  constructor(
    @InjectModel(Replay.name) private readonly replay: Model<Replay>,
    private readonly player: PlayerService,
    private readonly statsGatherer: StatsGathererService) { }

  async findReplays(playerId: string, cond: DateCondition, timePoint: Date, limit: number): Promise<ReplaysOverview> {
    const playerObjectId = new mongoose.Types.ObjectId(playerId);

    return {
      total: await this.replay.countDocuments({ 'tracks.player': playerObjectId }),
      replays: (await this.replay.aggregate([
        { $match: {
          $and: [
            { 'tracks.player': playerObjectId },
            { 'createdAt': { [cond]: timePoint }}
          ]
        }},
        { $sort : { createdAt : -1 } },
        { $limit: Math.min(25, limit) },
        ...ReplayService.populateTracksWithPlayerInfo(),
        { $sort : { createdAt : -1 } },
        { $project: { 'tracks.data': 0 }}]))
        .map(x => ({
          id: x._id,
          duration: x.duration,
          tracks: x.tracks.map(x => ({ 
            player: {
              id: x.player,
              nickname: { nickname: x.playerInfo.nickname, discriminator: x.playerInfo.discriminator }
            },
            cpm: x.cpm,
            accuracy: x.accuracy
          })),
          createdAt: x.createdAt
        }))};
  }

  async findReplayById(replayId: string): Promise<ReplaySnapshot> {
    const replay = (await this.replay.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(replayId) }},
      ...ReplayService.populateTracksWithPlayerInfo()
    ]))
      .map(x => ({
        id: x._id,
        duration: x.duration,
        tracks: x.tracks.map(x => ({ 
          player: {
            id: x.player,
            nickname: { nickname: x.playerInfo.nickname, discriminator: x.playerInfo.discriminator }
          },
          cpm: x.cpm,
          accuracy: x.accuracy,
          data: x.data
        })),
        createdAt: x.createdAt
      }));

    if (replay.length === 0) {
      throw new NotFoundException('Unknown replay id');
    }

    return replay[0];
  }

  async upload(replay: ReplayDto, stats: readonly ReplayStats[]) {
    try {
      await new this.replay({
        duration: Math.ceil(replay.duration / 1000),
        tracks: replay.tracks
          .sort((a, b) => stats.findIndex(x => x.playerId === a.playerId) - stats.findIndex(x => x.playerId === b.playerId))
          .map((x, i) => {
            const track = new Track();

            track.player = new this.player.model({ _id: x.playerId });
            track.cpm = stats[i].cpm;
            track.accuracy = stats[i].accuracy;
            track.data = x.data.map(x => {
              const e = new InputEvent();
              e.char = x.char;
              e.correct = x.correct;
              e.timestamp = x.timestamp;
              return e;
            });

            return track;
          })
      })
        .save();
    } catch (e) {
      throw new BadRequestException('Failed to upload replay');
    }
  }

  async updateStats(stats: ReplayStats[]) {
    this.player.updateStats(stats);
  }

  async uploadAndUpdateStats(replay: ReplayDto) {
    const stats = await this.statsGatherer.gather(replay);

    await this.upload(replay, stats);
    await this.updateStats(stats);
  }

  private static populateTracksWithPlayerInfo() {
    return [
      { $unwind: '$tracks' },
      {
        $lookup: {
          from: 'players',
          localField: 'tracks.player',
          foreignField: '_id',
          pipeline: [
            { $project: { _id: 0, nickname: 1, discriminator: 1 }}
          ],
          as: 'tracks.playerInfo'
        }
      },
      { $unwind: '$tracks.playerInfo' },
      {
        $group: { 
          _id: '$_id',
          duration: { $first: '$duration' },
          tracks: { $push: '$tracks' },
          createdAt: { $first: '$createdAt'}
        }
      }
    ];
  }
}
