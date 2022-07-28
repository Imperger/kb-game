import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

import { Player } from './Player';
import { BackendApiService } from './backend-api.service';
import { EventEmitterService } from './event-emitter.service';
import { LobbyEventType } from './interfaces/lobby-event.interface';
import { PlayerDesc } from './game.service';
import { instanceUrl } from './instance-url';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ParticipantService {
  private readonly waitForOwnerTimeout = 10000;

  private readonly roomCapacity = 10;

  private readonly _players = new Map<Socket, Player>();

  private readonly _$ownerPresence = new Subject<boolean>();

  constructor(
    private readonly eventEmitter: EventEmitterService,
    private readonly backendApi: BackendApiService,
  ) {}

  newClient(client: Socket) {
    setTimeout(() => this.disconnectDangling(client), 1000);
  }

  async disconnectClient(client: Socket) {
    const p = this._players.get(client);

    if (p) {
      this.eventEmitter.emitLobbyEvent({
        type: LobbyEventType.PlayerLeaves,
        data: { id: p.id },
      });

      if (p.id === process.env.OWNER_ID) {
        this._$ownerPresence.next(false);
      } else {
        await this.backendApi.unlinkGame(p.id);
      }

      this._players.delete(client);
    }
  }

  async addPlayer(player: PlayerDesc): Promise<boolean> {
    // Reserve slot for owner
    const capacity = this.roomCapacity - +(process.env.OWNER_ID !== player.id);

    if (
      this._players.size < capacity &&
      ![...this._players.values()].find((x) => x.id === player.id)
    ) {
      if (
        player.id !== process.env.OWNER_ID &&
        !(await this.backendApi.linkGame(player.id, {
          instanceUrl: instanceUrl(),
        }))
      ) {
        return false;
      }

      const p = new Player(
        player.socket,
        player.id,
        player.nickname,
        this.findFreeSlot(),
      );

      this._players.set(player.socket, p);

      this._$ownerPresence.next(true);

      this.eventEmitter.emitLobbyEvent({
        type: LobbyEventType.PlayerJoined,
        data: { id: player.id, nickname: player.nickname, slot: p.slot },
      });

      return true;
    } else {
      setImmediate(() => player.socket.disconnect());

      return false;
    }
  }

  findBySocket(socket: Socket) {
    return this._players.get(socket);
  }

  dispose() {
    this._players.forEach((p, s) => !s.disconnected && s.disconnect());
    this._players.clear();
  }

  get occupancy(): number {
    return this._players.size;
  }

  get ownerNickname(): string {
    return (
      [...this._players.values()].find((p) => p.id === process.env.OWNER_ID)
        ?.nickname ?? 'Unknown'
    );
  }

  get players(): Player[] {
    return [...this._players.values()];
  }

  get $ownerPresence(): Observable<boolean> {
    return this._$ownerPresence;
  }

  private disconnectDangling(client: Socket) {
    if (!(this._players.has(client) || client.disconnected)) {
      client.disconnect();
    }
  }

  private findFreeSlot(): number {
    const slotPool = new Set([...Array(10).keys()]);

    [...this._players.values()].forEach((x) => slotPool.delete(x.slot));

    return [...slotPool][0];
  }
}
