import { Injectable } from "@nestjs/common";
import { ReplayDto } from "./dto/replay-dto";
import { ReplayStats } from "./interfaces/replay-stats";
import { Track } from './dto/replay-dto';

interface TrackWithSortdAttributes extends Track {
  correctHits: number;
  playTime: number;
  accuracy: number;
}

@Injectable()
export class StatsGathererService {
  gather(replay: ReplayDto): ReplayStats[] {
    return replay.tracks
      .map(x => StatsGathererService.attachSortAttributes(x, replay.duration))
      .sort(StatsGathererService.trackComparator)
      .map(StatsGathererService.populateStats);
  }

  private static attachSortAttributes(track: Track, gameDuration: number): TrackWithSortdAttributes {
    const correctHits = track.data.filter(x => x.correct).length;

    return {
      ...track,
      playTime: track.finished ? track.data[track.data.length - 1].timestamp : gameDuration,
      correctHits,
      accuracy: correctHits / (track.data.length ?? 1)
    };
  }

  private static trackComparator(a: TrackWithSortdAttributes, b: TrackWithSortdAttributes): number {
    if (a.correctHits === b.correctHits) {
      if (a.playTime === b.playTime) {
        return b.accuracy - a.accuracy;
      }

      return a.playTime - b.playTime;
    }

    return b.correctHits - a.correctHits;
  }

  private static populateStats(track: TrackWithSortdAttributes, position: number): ReplayStats {
    return {
      playerId: track.playerId,
      winner: position === 0,
      cpm: Math.round(track.correctHits * (60000 / track.playTime)),
      accuracy: track.accuracy
    };
  }
}
