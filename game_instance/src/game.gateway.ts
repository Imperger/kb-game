import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import { JwtArg } from './decorators/jwt-arg';
import { GameService, GameState, LobbyState } from './game/game.service';

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

type Base64Image = string;

interface GameImageField {
  field: Base64Image;
}

@WebSocketGateway({ cors: true })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly game: GameService) {}

  async afterInit(server: Server) {
    this.game.server = server;
  }

  handleConnection(client: Socket) {
    this.game.newClient(client);
  }

  handleDisconnect(client: Socket) {
    this.game.disconnectClient(client);
  }

  @SubscribeMessage('auth')
  async auth(
    @ConnectedSocket() client: Socket,
    @JwtArg() playerToken: PlayerToken,
  ): Promise<AuthResult> {
    if (
      playerToken.exp * 1000 > Date.now() &&
      playerToken.instanceId === process.env.INSTANCE_ID &&
      (await this.game.addPlayer({
        socket: client,
        id: playerToken.playerId,
        nickname: playerToken.nickname,
      }))
    ) {
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

  @SubscribeMessage('lobby_state')
  lobbyState(): LobbyState {
    return this.game.lobby();
  }

  @SubscribeMessage('select_scenario')
  selectScenario(
    @ConnectedSocket() client: Socket,
    @MessageBody() id: string,
  ): boolean {
    return this.game.selectScenario(id);
  }

  @SubscribeMessage('start_game')
  startGame(): Promise<boolean> {
    return this.game.startGame();
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
