type Seconds = number;

export interface Nickname {
  nickname: string;
  discriminator: number;
}

interface PlayerSnapshot {
  id: string;
  nickname: Nickname;
}

export interface InputEventSnapshot {
  char: string;
  correct: boolean;
  timestamp: number;
}

export interface TrackSnapshot {
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
