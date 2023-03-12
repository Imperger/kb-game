import { PopulatedLine } from './game-field-builder';
import { ReplayRecord } from './Replay';

export const WrongChar = -1;
export type WidthToThis = number;
export type PressKeyResult = WidthToThis | typeof WrongChar;

export class ProgressTracker {
  private line = 0;
  private inTrackIdx = 0;
  private inScenarionIdx = 0;
  private _replay: ReplayRecord[] = [];
  constructor(
    private scenario: string,
    private tracks: PopulatedLine[],
    private startTime: number,
  ) {}

  pressKey(char: string): PressKeyResult {
    if (this.inScenarionIdx >= this.scenario.length) return WrongChar;

    const correct = this.scenario[this.inScenarionIdx] === char;

    this.record(char, correct);

    if (correct) {
      const width = this.tracks[this.line].widths[this.inTrackIdx];

      ++this.inScenarionIdx;

      this.inTrackIdx =
        (this.inTrackIdx + 1) % this.tracks[this.line].widths.length;

      if (this.inTrackIdx === 0) {
        ++this.line;
      }

      return this.inTrackIdx === 0 ? 0 : width;
    }

    return WrongChar;
  }

  record(char: string, correct: boolean) {
    this._replay.push({
      char,
      correct,
      timestamp: Date.now() - this.startTime,
    });
  }

  get width(): number {
    const width = this.tracks[this.line].widths[this.inTrackIdx];

    return this.inTrackIdx === 0 ? 0 : width;
  }

  get finished() {
    return this.inScenarionIdx >= this.scenario.length;
  }

  get progress(): number {
    return this.inScenarionIdx / this.scenario.length;
  }

  get replay(): readonly ReplayRecord[] {
    return this._replay;
  }

  get cursorPosition(): { width: number; line: number } {
    const ret = { width: 0, line: 0 };

    if (this.inTrackIdx > 0) {
      ret.width = this.tracks[this.line].widths[this.inTrackIdx - 1];
      ret.line = this.line;
    } else if (this.line > 0) {
      ret.line = this.line - 1;
      ret.width =
        this.tracks[ret.line].widths[this.tracks[ret.line].widths.length - 1];
    }

    return ret;
  }
}
