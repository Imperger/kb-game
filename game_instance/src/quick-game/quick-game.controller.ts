import { Controller, Get, Inject, UseGuards } from '@nestjs/common';

import { SpawnerGuard } from '@/guards/spawner.guard';
import { ServerDescription } from './interfaces/server-description';
import { GameService } from '@/game/game.service';
import { QuickGameService } from './quick-game.service';

@Controller()
export class QuickGameController {
  constructor(@Inject(GameService) private readonly game: QuickGameService) {}

  @UseGuards(SpawnerGuard)
  @Get('info')
  info(): ServerDescription {
    return this.game.serverDescription();
  }
}
