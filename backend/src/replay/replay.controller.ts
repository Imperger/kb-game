import { Body, Controller, Get, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';

import { ReplayDto } from './dto/replay-dto';
import { JwtKnownSpawnerGuard } from '@/spawner/decorators/jwt-known-spawner.guard';
import { ReplayService } from './replay.service';
import { JwtGuard } from '@/jwt/decorators/jwt.guard';
import { ParseDatePipe } from '@/common/pipes/parse-date.pipe';
import { ReplayOverview } from './interfaces/replay-overview';
import { Player } from '@/player/decorators/player.decorator';
import { Player as PlayerSchema } from '@/player/schemas/player.schema';

@Controller('replay')
export class ReplayController {
  constructor(
    private readonly replay: ReplayService) { }

  @UseGuards(JwtGuard)
  @Get()
  async currentPlayerReplays(
    @Player() player: PlayerSchema,
      @Query('since', ParseDatePipe) since: Date,
      @Query('limit', ParseIntPipe) limit: number
  ): Promise<ReplayOverview[]> {
    return this.replay.findReplays(player.id, since, limit);
  }

  @UseGuards(JwtKnownSpawnerGuard)
  @Post()
  async uploadReplay(@Body() replay: ReplayDto) {
    await this.replay.uploadAndUpdateStats(replay);
  }
}
