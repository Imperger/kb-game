import { firstValueFrom, Subject } from 'rxjs';
import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { BackendApiService } from './game/backend-api.service';
import { ParticipantService } from './game/participant.service';
import { instanceUrl } from './game/instance-url';

@Injectable()
export class ShutdownService implements OnModuleInit {
  /**
   * After elapsed the instance will be shut down independent of any state
   */
  private readonly globalTtl = 3600000;

  private globalShutdownTimer: NodeJS.Timer;

  private readonly $shutdowner = new Subject<void>();

  constructor(
    @Inject(forwardRef(() => ParticipantService))
    protected readonly participant: ParticipantService,
    private readonly backendApi: BackendApiService,
  ) {}

  onModuleInit() {
    this.setupAutoShutdown();
  }

  subscribeToShutdown(shutdown: () => void): void {
    firstValueFrom(this.$shutdowner).then(() => shutdown());
  }

  shutdown(): void {
    clearTimeout(this.globalShutdownTimer);
    this.$shutdowner.next();
  }

  protected setupAutoShutdown() {
    this.globalShutdownTimer = setTimeout(
      () => this.autoShutdown(),
      this.globalTtl,
    );
  }

  protected autoShutdown() {
    this.backendApi.unlinkGameAll(instanceUrl());
    this.shutdown();
  }
}
