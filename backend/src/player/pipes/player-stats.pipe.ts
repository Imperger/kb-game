import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

import { Player } from '@/player/schemas/player.schema';
import { PlayerStats } from '../interfaces/player-stats';

@Injectable()
export class PlayerStatsPipe implements PipeTransform {
  transform(player: Player, metadata: ArgumentMetadata): PlayerStats {
    return {
      nickname: player.nickname,
      discriminator: player.discriminator,
      game: player.game ? { instanceUrl: player.game.instanceUrl, updatedAt: player.game.updatedAt } : null,
      hoursInGame: player.hoursInGame,
      elo: player.elo,
      totalPlayed: player.totalPlayed,
      totalWins: player.totalWins,
      averageCpm: player.averageCpm,
      maxCpm: player.maxCpm,
      quickGameQueue: player.quickGameQueue
    };
  }
}
