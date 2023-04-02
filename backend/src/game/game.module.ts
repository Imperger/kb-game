import { Module } from '@nestjs/common';

import { GameController } from './game.controller';
import { GameService } from './game.service';
import { anyoneWithDeadlineStrategyFactory } from './match-making-strategies/anyone-with-deadline-strategy';
import { matchMakingStrategyToken } from './match-making-strategies/match-makin-strategy';
import { MatchMakingService } from './matchmaking.service';
import { QuickGameQueueResponderService } from './quick-game-queue-responder.service';

import { PlayerModule } from '@/player/player.module';
import { ScenarioModule } from '@/scenario/scenario.module';
import { SpawnerModule } from '@/spawner/spawner.module';

@Module({
  imports: [SpawnerModule, PlayerModule, ScenarioModule],
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
