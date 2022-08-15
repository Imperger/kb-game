import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import { JwtArg } from '../decorators/jwt-arg';
import { GameService, GameState } from './game.service';
import { ParticipantService } from './participant.service';
import { WsServerRefService } from './ws-server-ref.service';
import { ConfigService } from './config.service';

interface PlayerToken {
  instanceId: string;
  playerId: string;
  nickname: string;
  iat: number;
  exp: number;
}

export enum AuthResult {
  Unauthorized = 0,
  CustomGame = 1,
  QuickGame = 2,
}

type Base64Image = string;

interface GameImageField {
  field: Base64Image;
}

@Injectable()
export abstract class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly wsServerRef: WsServerRefService,
    private readonly participant: ParticipantService,
    protected readonly game: GameService,
    protected readonly config: ConfigService,
  ) {}

  abstract get gameType(): AuthResult;

  async afterInit(server: Server) {
    this.wsServerRef.server = server;
  }

  handleConnection(client: Socket) {
    if (this.game.isStarted) {
      client.disconnect();
      return;
    }

    this.participant.newClient(client);
  }

  handleDisconnect(client: Socket) {
    this.participant.disconnectClient(client);
  }

  @SubscribeMessage('auth')
  async auth(
    @ConnectedSocket() client: Socket,
    @JwtArg() playerToken: PlayerToken,
  ): Promise<AuthResult> {
    if (
      playerToken.exp * 1000 > Date.now() &&
      playerToken.instanceId === this.config.instanceId &&
      (await this.participant.addPlayer({
        socket: client,
        id: playerToken.playerId,
        nickname: playerToken.nickname,
      }))
    ) {
      return this.gameType;
    } else {
      return AuthResult.Unauthorized;
    }
  }

  @SubscribeMessage('game_field')
  gameField(): GameImageField {
    return { field: this.game.gameFieldImage };
  }

  @SubscribeMessage('send_key')
  sendChar(@ConnectedSocket() client: Socket, @MessageBody() key: string) {
    return this.game.pressKey(client, key);
  }

  @SubscribeMessage('game_state')
  gameState(): GameState {
    return this.game.game();
  }
}
