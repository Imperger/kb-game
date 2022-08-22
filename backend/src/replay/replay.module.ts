import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PlayerModule } from '@/player/player.module';
import { SpawnerModule } from '@/spawner/spawner.module';
import { ReplayController } from './replay.controller';
import { ReplayService } from './replay.service';
import { Replay, ReplaySchema } from './schemas/replay.schema';
import { StatsGathererService } from './stats-gatherer.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Replay.name, schema: ReplaySchema }]),
    SpawnerModule,
    PlayerModule],
  controllers: [ReplayController],
  providers: [ReplayService, StatsGathererService]
})
export class ReplayModule { }
