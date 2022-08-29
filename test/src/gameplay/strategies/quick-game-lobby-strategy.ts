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

  private _bufferedEvents!: LobbyEvent[];

  private switchStrategy!: (strategy: Strategy) => void;

  private lobbyEventHandler = (e: LobbyEvent) => this.lobbyEvent(e);

  public readonly $gameWillStart = new Subject<void>();

  async activate (socket: Socket<DefaultEventsMap, DefaultEventsMap>, switchStrategy: (strategy: Strategy) => void): Promise<void> {
    this.socket = socket;
    this.switchStrategy = switchStrategy;

    setTimeout(() => this.replayBufferedEvents(), 0);

    ({ players: this._players } = (await this.fetchLobbyState()));

    this.socket.on('lobby_event', this.lobbyEventHandler);
  }

  async deactivate (): Promise<void> {
    this.socket.off('lobby_event', this.lobbyEventHandler);
  }

  private lobbyEvent (e: LobbyEvent): void {
    switch (e.type) {
      case LobbyEventType.PlayerJoined:
        this.playerJoinedEvent(e.data as PlayerJoinedEvent);
        break;
      case LobbyEventType.PlayerLeaves:
        this.playerLeavesEvent(e.data as PlayerLeavesEvent);
        break;
      case LobbyEventType.GameWillStart:
        this.switchStrategy(new GameStrategy());
        this.$gameWillStart.next();
        break;
    }
  }

  get players (): Player[] {
    return this._players;
  }

  set bufferedEvents (events: unknown) {
    this._bufferedEvents = events as LobbyEvent[];
  }

  private replayBufferedEvents () {
    this._bufferedEvents.forEach(x => this.lobbyEvent(x));
    this._bufferedEvents = [];
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
