import { Controller, Get, Post, UseGuards } from '@nestjs/common';

import { HasScopes } from 'src/auth/decorators/has-scopes.decorator';
import { JwtGuard } from 'src/jwt/decorators/jwt.guard';
import { Player } from 'src/player/decorators/player.decorator';
import { Scope } from '../auth/scopes';
import { GameService } from './game.service';
import { Player as PlayerSchema } from '../player/schemas/player.schema';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}
    
  @HasScopes(Scope.PlayGame)
  @UseGuards(JwtGuard)
  @Post('new_custom')
  async new_custom(@Player() player: PlayerSchema) {
    return await this.gameService.newCustom({ playerId: player.id, nickname: player.nickname });
  }

  @HasScopes(Scope.PlayGame)
  @UseGuards(JwtGuard)
  @Get('list')
  async listGames() {
    return await this.gameService.listGames();
  }
}
