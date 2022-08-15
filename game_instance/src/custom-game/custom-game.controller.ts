import { Controller, Get, Inject, UseGuards } from '@nestjs/common';

import { SpawnerGuard } from '@/guards/spawner.guard';
import { ServerDescription } from './interfaces/server-description';
import { CustomGameService } from './custom-game.service';
import { GameService } from '@/game/game.service';

@Controller()
export class CustomGameController {
  constructor(@Inject(GameService) private readonly game: CustomGameService) {}

  @UseGuards(SpawnerGuard)
  @Get('info')
  info(): ServerDescription {
    return this.game.serverDescription();
  }
}
