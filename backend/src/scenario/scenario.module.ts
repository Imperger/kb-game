import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ScenarioService } from './scenario.service';
import { ScenarioController } from './scenario.controller';
import { Scenario, ScenarioSchema } from './schemas/scenario.schema';
import { SpawnerModule } from 'src/spawner/spawner.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Scenario.name, schema: ScenarioSchema }]),
    SpawnerModule
  ],
  providers: [ScenarioService],
  controllers: [ScenarioController]
})
export class ScenarioModule {}
