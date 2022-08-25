type Seconds = number;

export interface Nickname {
  nickname: string;
  discriminator: number;
}

export interface PlayerOverview {
  id: string;
  nickname: Nickname;
}

export interface TrackOverview {
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
