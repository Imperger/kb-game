import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class WsServerRefService {
  private ref!: Server;

  set server(server: Server) {
    this.ref = server;
  }

  get server(): Server {
    return this.ref;
  }
}
