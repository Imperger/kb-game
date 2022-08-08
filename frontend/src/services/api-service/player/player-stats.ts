export interface CurrentGame {
  instanceUrl: string;
  updatedAt?: Date;
}

export interface PlayerStats {
  nickname: string;
  discriminator: number;
  game: CurrentGame | null;
  hoursInGame: number;
  elo: number;
  totalPlayed: number;
  totalWins: number;
  averageCpm: number;
  maxCpm: number;
  quickGameQueue: Date | null;
}
