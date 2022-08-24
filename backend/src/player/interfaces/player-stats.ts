import { Player } from "../schemas/player.schema";

export type PlayerStats = Pick<
Player,
'id' | 'nickname' | 'discriminator' | 'game' | 'hoursInGame' |
'elo' | 'totalPlayed' | 'totalWins' | 'averageCpm' | 'maxCpm' | 'quickGameQueue'>;
