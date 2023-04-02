import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ScenarioController } from './scenario.controller';
import { ScenarioService } from './scenario.service';
import { Scenario, ScenarioSchema } from './schemas/scenario.schema';

import { SpawnerModule } from '@/spawner/spawner.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Scenario.name, schema: ScenarioSchema }
    ]),
    SpawnerModule
  ],
  controllers: [ScenarioController],
  providers: [ScenarioService],
  exports: [ScenarioService]
})
export class ScenarioModule {}
