import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { JwtArg } from './decorators/jwt-arg';

interface PlayerToken {
  instanceId: string;
  playerId: string;
  nickname: string;
  iat: number;
  exp: number;
}

enum AuthResult {
  Unauthorized = 0,
  CustomGame = 1,
  QuickGame = 2,
}

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly players = new Map<Socket, any>();

  handleConnection(client: Socket) {
    setTimeout(() => this.disconnectDangling(client), 1000);
  }

  handleDisconnect(client: Socket) {
    // throw new Error('Method not implemented.');
  }

  @SubscribeMessage('auth')
  handleMessage(
    client: Socket,
    @JwtArg() playerToken: PlayerToken,
  ): AuthResult {
    if (playerToken.exp * 1000 > Date.now()) {
      switch (process.env.GAME_TYPE.toLowerCase()) {
        case 'custom':
          return AuthResult.CustomGame;
        case 'quick':
          return AuthResult.QuickGame;
      }
    } else {
      return AuthResult.Unauthorized;
    }
  }

  private disconnectDangling(client: Socket) {
    if (!(this.players.has(client) || client.disconnected)) {
      client.disconnect();
    }
  }
}
