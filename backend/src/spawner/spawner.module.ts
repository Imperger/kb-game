import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SpawnerController } from './spawner.controller';
import { SpawnerService } from './spawner.service';
import { Spawner, SpawnerSchema } from './schemas/spawner.schema';
import { Base64DecoderPipe } from './pipes/base64-decoder.pipe';
import { ConfigHelperModule } from '../config/config-helper.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Spawner.name, schema: SpawnerSchema }]),
    ConfigHelperModule
  ], 
  controllers: [SpawnerController],
  providers: [
    SpawnerService,
    Base64DecoderPipe],
  exports: [SpawnerService]
})
export class SpawnerModule {}
