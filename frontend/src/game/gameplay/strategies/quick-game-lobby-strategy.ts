import { Subject } from 'rxjs';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Socket } from 'socket.io-client';

import { Strategy } from './strategy';
import { GameStrategy } from './game-strategy';
import { LobbyEvent, LobbyEventType, PlayerJoinedEvent, PlayerLeavesEvent } from './interfaces/lobby-events';
import { remoteCall } from '../remote-call';

export interface Player {
  id: string;
  nickname: string;
  slot: number;
}

export interface LobbyState {
  players: Player[];
}

export class QuickGameLobbyStrategy extends Strategy {
  private socket!: Socket;

  private _players: Player[] = [];

  private switchStrategy!: (strategy: Strategy) => void;

  public readonly $gameWillStart = new Subject<void>();

  async activate (socket: Socket<DefaultEventsMap, DefaultEventsMap>, switchStrategy: (strategy: Strategy) => void): Promise<void> {
    this.socket = socket;
    this.switchStrategy = switchStrategy;

    await super.activate(socket, switchStrategy);

    ({ players: this._players } = (await this.fetchLobbyState()));
  }

  async deactivate (): Promise<void> {
    await super.deactivate();
  }

  async onEvent (e: LobbyEvent): Promise<boolean> {
    switch (e.type) {
      case LobbyEventType.PlayerJoined:
        this.playerJoinedEvent(e.data as PlayerJoinedEvent);
        return true;
      case LobbyEventType.PlayerLeaves:
        this.playerLeavesEvent(e.data as PlayerLeavesEvent);
        return true;
      case LobbyEventType.GameWillStart:
        this.switchStrategy(new GameStrategy());
        this.$gameWillStart.next();
        return true;
      default:
        return false;
    }
  }

  get players (): Player[] {
    return this._players;
  }

  private playerJoinedEvent (e: PlayerJoinedEvent): void {
    if (this._players.findIndex(x => x.id === e.id) === -1) {
      this.players.push(e);
    }
  }

  private playerLeavesEvent (e: PlayerLeavesEvent): void {
    const remove = this.players.findIndex(x => x.id === e.id);
    if (remove >= 0) {
      this.players.splice(remove, 1);
    }
  }

  private async fetchLobbyState (): Promise<LobbyState> {
    return await remoteCall(this.socket, 'lobby_state');
  }
}
