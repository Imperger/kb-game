import { Injectable } from '@nestjs/common';

import { GameEvent } from './interfaces/game-event.interface';
import { LobbyEvent } from './interfaces/lobby-event.interface';
import { WsServerRefService } from './ws-server-ref.service';

@Injectable()
export class EventEmitterService {
  constructor(private readonly wsServerRef: WsServerRefService) {}

  emitLobbyEvent(e: LobbyEvent): void {
    this.wsServerRef.server.emit('lobby_event', e);
  }

  emitGameEvent(e: GameEvent): void {
    this.wsServerRef.server.emit('game_event', e);
  }
}
