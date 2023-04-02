import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { Player, PlayerSchema } from './schemas/player.schema';

import { ScoringModule } from '@/scoring/scoring.module';
import { SpawnerModule } from '@/spawner/spawner.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    SpawnerModule,
    ScoringModule
  ],
  providers: [PlayerService],
  controllers: [PlayerController],
  exports: [PlayerService]
})
export class PlayerModule {}
