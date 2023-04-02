import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import { Player } from './decorators/player.decorator';
import { UnlinkGameAllDto } from './dto/unlink-game-all.dto';
import { LinkedGame } from './interfaces/linked-game';
import { PlayerStats } from './interfaces/player-stats';
import { PlayerByNicknamePipe } from './pipes/player-by-nickname.pipe';
import { PlayerStatsPipe } from './pipes/player-stats.pipe';
import { PlayerService } from './player.service';

import { JwtGuard } from '@/jwt/decorators/jwt.guard';
import { JwtKnownSpawnerGuard } from '@/spawner/decorators/jwt-known-spawner.guard';

@Controller('player')
export class PlayerController {
  constructor(private readonly player: PlayerService) {}

  @UseGuards(JwtKnownSpawnerGuard)
  @Patch(':id/link_game')
  linkGame(@Param('id') id: string, @Body() game: LinkedGame) {
    return this.player.linkGame(id, game);
  }

  @UseGuards(JwtKnownSpawnerGuard)
  @Patch(':id/unlink_game')
  unlinkGame(@Param('id') id: string) {
    return this.player.unlinkGame(id);
  }

  @UseGuards(JwtKnownSpawnerGuard)
  @Patch('unlink_game')
  unlinkGameAll(@Body() unlinked: UnlinkGameAllDto) {
    return this.player.unlinkGameAll(unlinked.instanceUrl);
  }

  @Get(':nickname')
  playerStats(
    @Param('nickname', PlayerByNicknamePipe, PlayerStatsPipe)
    player: PlayerStats
  ) {
    return player;
  }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@Player(PlayerStatsPipe) player: PlayerStats): PlayerStats {
    return player;
  }
}
