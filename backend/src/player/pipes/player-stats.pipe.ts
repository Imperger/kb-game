import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

import { PlayerStats } from '../interfaces/player-stats';

import { Player } from '@/player/schemas/player.schema';

@Injectable()
export class PlayerStatsPipe implements PipeTransform {
  transform(player: Player, _metadata: ArgumentMetadata): PlayerStats {
    return {
      id: player.id,
      nickname: player.nickname,
      discriminator: player.discriminator,
      game: player.game
        ? {
            instanceUrl: player.game.instanceUrl,
            updatedAt: player.game.updatedAt
          }
        : null,
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
