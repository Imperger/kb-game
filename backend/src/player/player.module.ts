import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Player, PlayerSchema } from './schemas/player.schema';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { SpawnerModule } from '@/spawner/spawner.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    SpawnerModule
  ],
  providers: [PlayerService],
  controllers: [PlayerController],
  exports: [PlayerService]
})
export class PlayerModule {}
