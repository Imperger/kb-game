import { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ReplayDto } from './dto/replay-dto';
import { InputEvent, Replay, Track } from './schemas/replay.schema';
import { PlayerService } from '@/player/player.service';
import { StatsGathererService } from './stats-gatherer.service';
import { ReplayStats } from './interfaces/replay-stats';

@Injectable()
export class ReplayService {
  constructor(
    @InjectModel(Replay.name) private readonly replay: Model<Replay>,
    private readonly player: PlayerService,
    private readonly statsGatherer: StatsGathererService) { }

  async upload(replay: ReplayDto, stats: readonly ReplayStats[]) {
    try {
      await new this.replay({
        tracks: replay.tracks
          .sort((a, b) => stats.findIndex(x => x.playerId === a.playerId) - stats.findIndex(x => x.playerId === b.playerId))
          .map(x => {
            const track = new Track();

            track.player = new this.player.model({ _id: x.playerId });
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

  async updateStats(replay: ReplayDto, stats: ReplayStats[]) {
    this.player.updateStats(stats);
  }

  async uploadAndUpdateStats(replay: ReplayDto) {
    const stats = await this.statsGatherer.gather(replay);

    await this.upload(replay, stats);
    await this.updateStats(replay, stats);
  }
}
