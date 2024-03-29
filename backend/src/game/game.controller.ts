import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards
} from '@nestjs/common';

import { ConnectToGameDto } from './dto/connect-to-game.dto';
import {
  CantStartGameException,
  EnterQuickMatchQueueException
} from './game-exception';
import { GameService } from './game.service';
import { QuickGameDescriptor } from './interfaces/quick-game-descriptor';
import { MatchMakingService } from './matchmaking.service';
import { QuickGameQueueResponderService } from './quick-game-queue-responder.service';

import { ScopeGuard } from '@/auth/guards/scope.guard';
import { Scope } from '@/auth/scopes';
import { JwtGuard } from '@/jwt/decorators/jwt.guard';
import { LoggerService } from '@/logger/logger.service';
import { Player } from '@/player/decorators/player.decorator';
import { Player as PlayerSchema } from '@/player/schemas/player.schema';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly quickGameQueueResponder: QuickGameQueueResponderService,
    private readonly matchmaking: MatchMakingService,
    private readonly logger: LoggerService
  ) {}

  @UseGuards(JwtGuard, ScopeGuard(Scope.PlayGame))
  @Put('enter_quick')
  async enterQuickGameQeue(@Req() req: any, @Player() player: PlayerSchema) {
    if (!(await this.gameService.cantStartGame())) {
      throw new CantStartGameException();
    }

    // Trying to enter the quick game queue
    if (await this.gameService.enterQuickQueue(player)) {
      return new Promise<QuickGameDescriptor>((resolve, _reject) => {
        /**
         * At this point request being in long polling state.
         * By saving a response handle that will later be used to notify
         * the player about the result of the matchmaking.
         */
        this.quickGameQueueResponder.register(player.id, resolve);
        this.matchmaking.enterQueue({
          id: player.id,
          nickname: player.nickname
        });

        req.raw.once('close', () => {
          // The player should being in the queue only while request in pending state
          if (this.quickGameQueueResponder.resolve(player.id, null)) {
            this.gameService.leaveQuickQueue({
              id: player.id,
              nickname: player.nickname
            });
          }
        });
      });
    } else {
      return Promise.reject(new EnterQuickMatchQueueException());
    }
  }

  @UseGuards(JwtGuard, ScopeGuard(Scope.PlayGame))
  @Put('leave_quick')
  async leaveQuickGameQeue(@Player() player: PlayerSchema) {
    return (
      (await this.quickGameQueueResponder.resolve(player.id, null)) &&
      this.gameService.leaveQuickQueue({
        id: player.id,
        nickname: player.nickname
      })
    );
  }

  @UseGuards(JwtGuard, ScopeGuard(Scope.PlayGame))
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

  @UseGuards(JwtGuard, ScopeGuard(Scope.PlayGame))
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

  @UseGuards(JwtGuard, ScopeGuard(Scope.PlayGame))
  @Get('list')
  async listGames() {
    return this.gameService.listGames();
  }
}
