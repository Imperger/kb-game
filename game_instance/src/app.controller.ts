import { Controller, Get, UseGuards } from '@nestjs/common';

import { GameService, ServerDescription } from './game/game.service';
import { SpawnerGuard } from './guards/spawner/spawner.guard';

@Controller()
export class AppController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(SpawnerGuard)
  @Get('info')
  info(): ServerDescription {
    return this.gameService.serverDescription();
  }
}
