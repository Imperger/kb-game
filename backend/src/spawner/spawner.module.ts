import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtKnownSpawnerGuard } from './decorators/jwt-known-spawner.guard';
import { Base64DecoderPipe } from './pipes/base64-decoder.pipe';
import { Spawner, SpawnerSchema } from './schemas/spawner.schema';
import { SpawnerController } from './spawner.controller';
import { SpawnerService } from './spawner.service';

import { ConfigHelperModule } from '@/config/config-helper.module';


@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Spawner.name, schema: SpawnerSchema }]),
    ConfigHelperModule
  ],
  controllers: [SpawnerController],
  providers: [SpawnerService, JwtKnownSpawnerGuard, Base64DecoderPipe],
  exports: [SpawnerService, JwtKnownSpawnerGuard]
})
export class SpawnerModule {}
