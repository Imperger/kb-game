import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';

import { SpawnerModule } from '@/spawner/spawner.module';
import { PlayerModule } from '@/player/player.module';

@Module({
  imports: [
    SpawnerModule,
    PlayerModule
  ],
  providers: [GameService],
  controllers: [GameController],
  exports: [GameService]
})
export class GameModule {}
