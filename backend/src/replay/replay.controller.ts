import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';

import { ReplayDto } from './dto/replay-dto';
import { ReplaysOverview } from './interfaces/replay-overview';
import { ReplaySnapshot } from './interfaces/replay-snapshot';
import { DateCondition, ReplayService } from './replay.service';

import { EnumValidationPipe } from '@/common/pipes/enum-validation.pipe';
import { ParseDatePipe } from '@/common/pipes/parse-date.pipe';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { JwtGuard } from '@/jwt/decorators/jwt.guard';
import { Player } from '@/player/decorators/player.decorator';
import { Player as PlayerSchema } from '@/player/schemas/player.schema';
import { JwtKnownSpawnerGuard } from '@/spawner/decorators/jwt-known-spawner.guard';

@Controller('replay')
export class ReplayController {
  constructor(private readonly replay: ReplayService) {}

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
  async replayById(
    @Param('id', ParseObjectIdPipe) replayId: string
  ): Promise<ReplaySnapshot> {
    return this.replay.findReplayById(replayId);
  }

  @UseGuards(JwtKnownSpawnerGuard)
  @Post()
  async uploadReplay(@Body() replay: ReplayDto): Promise<void> {
    await this.replay.uploadAndUpdateStats(replay);
  }
}
