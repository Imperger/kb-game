import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';

import { remoteCall } from '../remote-call';
import { GameStrategy } from './game-strategy';
import { LobbyEvent, LobbyEventType, PlayerJoinedEvent, PlayerLeavesEvent, SelectScenarioEvent } from './interfaces/lobby-events';
import { Strategy } from './strategy';

export interface Player {
  id: string;
  nickname: string;
  slot: number;
}

export interface Scenario {
  id: string;
  title: string;
  text: string;
}

export interface LobbyState {
  ownerId: string;
  players: Player[];
  scenario: Scenario | null;
}

export class LobbyStrategy extends Strategy {
  private socket!: Socket;

  private _ownerId!: string;
  private _players: Player[] = [];
  private _scenario!: Scenario | null;

  private switchStrategy!: (strategy: Strategy) => void;

  public readonly $gameWillStart = new Subject<void>();

  public readonly $selectedScenario = new Subject<Scenario>();

  async activate (socket: Socket, switchStrategy: (strategy: Strategy) => void): Promise<void> {
    this.socket = socket;
    this.switchStrategy = switchStrategy;

    await super.activate(socket, switchStrategy);

    let players: Player[];

    ({ ownerId: this._ownerId, players, scenario: this._scenario } =
      await this.fetchLobbyState());

    this._players.push(...players);
  }

  async deactivate (): Promise<void> {
    await super.deactivate();
  }

  async selectScenario (id: string): Promise<void> {
    await remoteCall(this.socket, 'select_scenario', id);
  }

  public startGame (): Promise<boolean> {
    return remoteCall(this.socket, 'start_game');
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
      case LobbyEventType.SelectScenario:
        this.$selectedScenario.next(e.data as SelectScenarioEvent);
        return true;
      default:
        return false;
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

  get scenario (): Scenario | null {
    return this._scenario;
  }
}
