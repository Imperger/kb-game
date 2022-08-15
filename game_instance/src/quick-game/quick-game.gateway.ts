import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

import { GameGateway, AuthResult } from '@/game/game.gateway';
import { LobbyState } from './interfaces/lobby-state';
import { QuickGameService } from './quick-game.service';

@WebSocketGateway({ cors: true })
export class QuickGameGateway extends GameGateway {
  protected readonly game: QuickGameService;

  get gameType() {
    return AuthResult.QuickGame;
  }

  @SubscribeMessage('lobby_state')
  lobbyState(): LobbyState {
    return this.game.lobby();
  }
}
