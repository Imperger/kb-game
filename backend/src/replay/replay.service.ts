import { Model, Types } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ReplayDto } from './dto/replay-dto';
import { InputEvent, Replay, Track } from './schemas/replay.schema';
import { PlayerService } from '@/player/player.service';
import { StatsGathererService } from './stats-gatherer.service';

@Injectable()
export class ReplayService {
  constructor(
    @InjectModel(Replay.name) private readonly replay: Model<Replay>,
    private readonly player: PlayerService,
    private readonly statsGatherer: StatsGathererService) { }

  async upload(replay: ReplayDto) {
    try {

      await new this.replay({
        tracks: replay.tracks.map(x => {
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

  async updateStats(replay: ReplayDto) {
    this.player.updateStats(await this.statsGatherer.gather(replay));
  }
}
