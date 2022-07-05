import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { HasScopes } from '@/auth/decorators/has-scopes.decorator';
import { JwtGuard } from '@/jwt/decorators/jwt.guard';
import { Player } from '@/player/decorators/player.decorator';
import { Scope } from '@/auth/scopes';
import { GameService } from './game.service';
import { Player as PlayerSchema } from '@/player/schemas/player.schema';
import { ScopeGuard } from '@/auth/guards/scope.guard';
import { ConnectToGameDto } from './dto/connect-to-game.dto';
import { JwtKnownSpawnerGuard } from '@/spawner/decorators/jwt-known-spawner.guard';
import { EndCustomGameDto } from './dto/end-custom-game.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}
    
  @HasScopes(Scope.PlayGame)
  @UseGuards(JwtGuard, ScopeGuard)
  @Post('new_custom')
  async new_custom(@Player() player: PlayerSchema) {
    return await this.gameService.newCustom({ playerId: player.id, nickname: player.nickname });
  }

  @HasScopes(Scope.PlayGame)
  @UseGuards(JwtGuard, ScopeGuard)
  @Post('connect')
  async connect(@Player() player: PlayerSchema, @Body() options: ConnectToGameDto) {
    return this.gameService.connect({ playerId: player.id, nickname: player.nickname }, options.instanceUrl);
  }

  @HasScopes(Scope.PlayGame)
  @UseGuards(JwtGuard, ScopeGuard)
  @Get('list')
  async listGames() {
    return await this.gameService.listGames();
  }
}
