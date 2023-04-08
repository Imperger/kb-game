import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';

import { GameGateway, AuthResult } from '@/game/game.gateway';
import { LobbyState } from './interfaces/lobby-state';
import { CustomGameService } from './custom-game.service';
import { OwnerGuard } from '@/guards/owner.guard';

@WebSocketGateway({ cors: true })
export class CustomGameGateway extends GameGateway {
  protected readonly game: CustomGameService;

  get gameType() {
    return AuthResult.CustomGame;
  }

  @SubscribeMessage('lobby_state')
  lobbyState(): LobbyState {
    return this.game.lobby();
  }

  @UseGuards(OwnerGuard)
  @SubscribeMessage('select_scenario')
  selectScenario(@MessageBody() id: string): Promise<boolean> {
    return this.game.selectScenario(id);
  }

  @UseGuards(OwnerGuard)
  @SubscribeMessage('start_game')
  startGame(): Promise<boolean> {
    return this.game.startGame();
  }
}
