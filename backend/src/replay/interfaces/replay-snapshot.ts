import { Seconds } from '@/common/duration';
import { Nickname } from '@/player/interfaces/nickname';

interface PlayerSnapshot {
  id: string;
  nickname: Nickname;
}

interface InputEventSnapshot {
  char: string;
  correct: boolean;
  timestamp: number;
}

interface TrackSnapshot {
  player: PlayerSnapshot;
  cpm: number;
  accuracy: number;
  data: InputEventSnapshot[];
}

export interface ReplaySnapshot {
  id: string;
  duration: Seconds;
  tracks: TrackSnapshot[];
  createdAt: Date;
}
