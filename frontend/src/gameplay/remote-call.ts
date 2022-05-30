import { Socket } from 'socket.io-client';

export const remoteCall = <T extends unknown[], R = unknown>(socket: Socket, event: string, ...args: T): Promise<R> =>
  new Promise<R>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Remote call timeout')), 1000);
    socket.emit(event, ...args, (ret: R) => { clearTimeout(timeout); resolve(ret); });
  });
