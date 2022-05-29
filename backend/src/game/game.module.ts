import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { MongooseModule } from '@nestjs/mongoose';

import { Game, GameSchema } from './schemas/game.schema';
import { SpawnerModule } from 'src/spawner/spawner.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    SpawnerModule
  ],
  providers: [GameService],
  controllers: [GameController],
  exports: [GameService]
})
export class GameModule {}
