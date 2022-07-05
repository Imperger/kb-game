import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';

import { SpawnerModule } from '@/spawner/spawner.module';

@Module({
  imports: [
    SpawnerModule
  ],
  providers: [GameService],
  controllers: [GameController],
  exports: [GameService]
})
export class GameModule {}
