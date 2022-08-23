import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ReplayDto } from './dto/replay-dto';
import { JwtKnownSpawnerGuard } from '@/spawner/decorators/jwt-known-spawner.guard';
import { ReplayService } from './replay.service';

@Controller('replay')
export class ReplayController {
  constructor(
    private readonly replay: ReplayService) { }

  @UseGuards(JwtKnownSpawnerGuard)
  @Post()
  async uploadReplay(@Body() replay: ReplayDto) {
    await this.replay.uploadAndUpdateStats(replay);
  }
}
