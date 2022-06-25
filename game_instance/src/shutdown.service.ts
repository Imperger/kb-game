import { Injectable } from '@nestjs/common';
import { firstValueFrom, Subject } from 'rxjs';

@Injectable()
export class ShutdownService {
  private shutdowner = new Subject<void>();

  subscribeToShutdown(shutdown: () => void): void {
    firstValueFrom(this.shutdowner).then(() => shutdown());
  }

  shutdown(): void {
    this.shutdowner.next();
  }
}
