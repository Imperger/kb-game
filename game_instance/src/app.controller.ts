import { Controller, Get } from '@nestjs/common';

import { GameService, ServerDescription } from './game/game.service';

@Controller()
export class AppController {
  constructor(private readonly gameService: GameService) {}

  @Get('info')
  info(): ServerDescription {
    return this.gameService.serverDescription();
  }
}
