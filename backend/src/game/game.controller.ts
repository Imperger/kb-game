import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { HasScopes } from '@/auth/decorators/has-scopes.decorator';
import { JwtGuard } from '@/jwt/decorators/jwt.guard';
import { Player } from '@/player/decorators/player.decorator';
import { Scope } from '@/auth/scopes';
import { GameService } from './game.service';
import { Player as PlayerSchema } from '@/player/schemas/player.schema';
import { ScopeGuard } from '@/auth/guards/scope.guard';
import { ConnectToGameDto } from './dto/connect-to-game.dto';
import { LoggerService } from '@/logger/logger.service';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly logger: LoggerService
  ) { }

  @HasScopes(Scope.PlayGame)
  @UseGuards(JwtGuard, ScopeGuard)
  @Post('new_custom')
  async new_custom(@Player() player: PlayerSchema) {
    const game = await this.gameService.newCustom({
      playerId: player.id,
      nickname: player.nickname
    });

    this.logger.log(
      `Requested game '${game.instanceUrl}' for '${player.id}:${player.nickname}#${player.discriminator}' ready`,
      'GameController'
    );

    return game;
  }

  @HasScopes(Scope.PlayGame)
  @UseGuards(JwtGuard, ScopeGuard)
  @Post('connect')
  async connect(
  @Player() player: PlayerSchema,
    @Body() options: ConnectToGameDto
  ) {
    const conn = await this.gameService.connect(
      { playerId: player.id, nickname: player.nickname },
      options.instanceUrl
    );

    this.logger.log(
      `Player '${player.id}:${player.nickname}#${player.discriminator}' is about to join '${options.instanceUrl}'`,
      'GameController'
    );

    return conn;
  }

  @HasScopes(Scope.PlayGame)
  @UseGuards(JwtGuard, ScopeGuard)
  @Get('list')
  async listGames() {
    return this.gameService.listGames();
  }
}
