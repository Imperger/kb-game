import { Seconds } from '@/common/duration';
import { Nickname } from '@/player/interfaces/nickname';

interface PlayerOverview {
  id: string;
  nickname: Nickname;
}

interface TrackOverview {
  player: PlayerOverview;
  cpm: number;
  accuracy: number;
}

export interface ReplayOverview {
  id: string;
  duration: Seconds;
  tracks: TrackOverview[];
  createdAt: Date;
}

export interface ReplaysOverview {
  total: number;
  replays: ReplayOverview[];
}
