import { Player } from "../schemas/player.schema";

export type PlayerStats = Pick<
Player,
'nickname' | 'discriminator' | 'game' | 'hoursInGame' |
'elo' | 'totalPlayed' | 'totalWins' | 'averageCpm' | 'maxCpm' | 'quickGameQueue'>;
