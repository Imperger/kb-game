import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';

import { remoteCall } from '../remote-call';
import { GameStrategy } from './game-strategy';
import { LobbyEvent, LobbyEventType, PlayerJoinedEvent, PlayerLeavesEvent } from './interfaces/lobby-events';
import { Strategy } from './strategy';

export interface Player {
  id: string;
  nickname: string;
  slot: number;
}

export interface Scenario {
  id: string;
  title: string;
}

export interface LobbyState {
  ownerId: string;
  players: Player[];
  scenarios: Scenario[];
}

export class LobbyStrategy extends Strategy {
  private socket!: Socket;

  private _ownerId!: string;
  private _players: Player[] = [];
  private _scenarios!: Scenario[];
  private _scenario!: Scenario;

  private lobbyEventHandler = (e: LobbyEvent) => this.lobbyEvent(e);

  private switchStrategy!: (strategy: Strategy) => void;

  public readonly $gameWillStart = new Subject<void>();

  async activate (socket: Socket, switchStrategy: (strategy: Strategy) => void): Promise<void> {
    this.socket = socket;
    this.switchStrategy = switchStrategy;

    this.socket.on('lobby_event', this.lobbyEventHandler);

    let players: Player[];

    ({ ownerId: this._ownerId, players, scenarios: this._scenarios } =
      await this.fetchLobbyState());

    this._players.push(...players);

    this._scenario = this.scenarios[0];
  }

  async deactivate (): Promise<void> {
    this.socket.off('lobby_event', this.lobbyEventHandler);
  }

  async selectScenario (id: string): Promise<void> {
    const selected = this.scenarios.find(x => x.id === id);

    if (selected) {
      this._scenario = selected;

      await remoteCall(this.socket, 'select_scenario', id);
    }
  }

  public startGame (): Promise<boolean> {
    return remoteCall(this.socket, 'start_game');
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

  private playerJoinedEvent (e: PlayerJoinedEvent): void {
    this.players.push(e);
  }

  private playerLeavesEvent (e: PlayerLeavesEvent): void {
    this.players.splice(this.players.findIndex(x => x.id === e.id), 1);
  }

  private async fetchLobbyState (): Promise<LobbyState> {
    return await remoteCall(this.socket, 'lobby_state');
  }

  get ownerId (): string {
    return this._ownerId;
  }

  get players (): Player[] {
    return this._players;
  }

  get scenarios (): Scenario[] {
    return this._scenarios;
  }
}
