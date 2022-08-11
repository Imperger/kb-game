import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';

import { SpawnerModule } from '@/spawner/spawner.module';
import { PlayerModule } from '@/player/player.module';
import { QuickGameQueueResponderService } from './quick-game-queue-responder.service';
import { MatchMakingService } from './matchmaking.service';
import { anyoneWithDeadlineStrategyFactory } from './match-making-strategies/anyone-with-deadline-strategy';
import { matchMakingStrategyToken } from './match-making-strategies/match-makin-strategy';

@Module({
  imports: [SpawnerModule, PlayerModule],
  providers: [
    {
      provide: matchMakingStrategyToken,
      useClass: anyoneWithDeadlineStrategyFactory(10)
    },
    GameService, 
    QuickGameQueueResponderService, 
    MatchMakingService
  ],
  controllers: [GameController],
  exports: [GameService]
})
export class GameModule {}
