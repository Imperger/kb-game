import { BadRequestException, Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';

import { Catch } from '@/common/decorators/catch.decorator';
import { JwtKnownSpawnerGuard } from '@/spawner/decorators/jwt-known-spawner.guard';
import { UnlinkGameAllDto } from './dto/unlink-game-all.dto';
import { LinkedGame } from './interfaces/linked-game';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(private readonly player: PlayerService) { }

  @UseGuards(JwtKnownSpawnerGuard)
  @Catch(BadRequestException)
  @Patch(':id/link_game')
  async linkGame(@Param('id') id: string, @Body() game: LinkedGame) {
    return { text: await this.player.linkGame(id, game) };
  }

  @UseGuards(JwtKnownSpawnerGuard)
  @Catch(BadRequestException)
  @Patch(':id/unlink_game')
  async unlinkGame(@Param('id') id: string) {
    return { text: await this.player.unlinkGame(id) };
  }

  @UseGuards(JwtKnownSpawnerGuard)
  @Catch(BadRequestException)
  @Patch('unlink_game')
  async unlinkGameAll(@Body() unlinked: UnlinkGameAllDto) {
    return { text: await this.player.unlinkGameAll(unlinked.instanceUrl) };
  }
}
