import { Socket } from 'socket.io';

import { PressKeyResult, ProgressTracker } from './progress-tracker';

export class Player {
  private tracker: ProgressTracker;
  constructor(
    public readonly socket: Socket,
    public readonly id: string,
    public readonly nickname: string,
    private _slot: number,
  ) {}

  pressKey(char: string): PressKeyResult {
    return this.tracker.pressKey(char);
  }

  get progress(): number {
    return this.tracker.progress;
  }

  get finished(): boolean {
    return this.tracker.finished;
  }

  get slot() {
    return this._slot;
  }

  set progressTracker(tracker: ProgressTracker) {
    this.tracker = tracker;
  }

  get progressTracker(): ProgressTracker {
    return this.tracker;
  }
}
