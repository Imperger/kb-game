import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';

import { ReplayDto } from './dto/replay-dto';
import { JwtKnownSpawnerGuard } from '@/spawner/decorators/jwt-known-spawner.guard';
import { DateCondition, ReplayService } from './replay.service';
import { JwtGuard } from '@/jwt/decorators/jwt.guard';
import { ParseDatePipe } from '@/common/pipes/parse-date.pipe';
import { ReplaysOverview } from './interfaces/replay-overview';
import { Player } from '@/player/decorators/player.decorator';
import { Player as PlayerSchema } from '@/player/schemas/player.schema';
import { EnumValidationPipe } from '@/common/pipes/enum-validation.pipe';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';

@Controller('replay')
export class ReplayController {
  constructor(
    private readonly replay: ReplayService) { }

  @UseGuards(JwtGuard)
  @Get()
  async currentPlayerReplays(
    @Player() player: PlayerSchema,
      @Query('cond', EnumValidationPipe(DateCondition)) cond: DateCondition,
      @Query('since', ParseDatePipe) since: Date,
      @Query('limit', ParseIntPipe) limit: number
  ): Promise<ReplaysOverview> {
    return this.replay.findReplays(player.id, cond, since, limit);
  }

  @Get(':id')
  async replayById(@Param('id', ParseObjectIdPipe) replayId: string) {
    return this.replay.findReplayById(replayId);
  }


  @UseGuards(JwtKnownSpawnerGuard)
  @Post()
  async uploadReplay(@Body() replay: ReplayDto) {
    await this.replay.uploadAndUpdateStats(replay);
  }
}
