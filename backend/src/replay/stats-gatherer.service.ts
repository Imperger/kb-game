import { Injectable } from "@nestjs/common";
import { ReplayDto } from "./dto/replay-dto";
import { ReplayStats } from "./interfaces/replay-stats";
import { Track } from './dto/replay-dto';

interface TrackWithSortdAttributes extends Track {
  correctHits: number;
  endTime: number;
  accuracy: number;
}

@Injectable()
export class StatsGathererService {
  async gather(replay: ReplayDto) {
    const stats: ReplayStats[] = [];

    replay.tracks
      .map(x => StatsGathererService.attachSortAttributes(x))
      .sort(StatsGathererService.trackComparator)
      .forEach(StatsGathererService.populateStats.bind(null, stats));

    return stats;
  }

  private static attachSortAttributes(track: Track): TrackWithSortdAttributes {
    let n = track.data.length - 1;

    while (n >= 0 && !track.data[n].correct)
      --n;

    const endTime = track.data[n].timestamp;
    let correctHits = 0;

    while (n >= 0) {
      if (track.data[n].correct) {
        correctHits++;
      }

      --n;
    }

    return { ...track, endTime, correctHits, accuracy: correctHits / (track.data.length ?? 1) };
  }

  private static trackComparator(a: TrackWithSortdAttributes, b: TrackWithSortdAttributes): number {
    if (a.correctHits === b.correctHits) {
      if (a.endTime === b.endTime) {
        return b.accuracy - a.accuracy;
      }

      return a.endTime - b.endTime;
    }

    return b.correctHits - a.correctHits;
  }

  private static populateStats(stats: ReplayStats[], track: TrackWithSortdAttributes, position: number): void {
    stats.push({
      playerId: track.playerId,
      winner: position === 0,
      cpm: track.correctHits * 60000 / track.endTime
    });
  }
}
