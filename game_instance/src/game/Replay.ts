export interface ReplayRecord {
  char: string;
  correct: boolean;
  timestamp: number;
}

export interface ReplayMetrics {
  accuracy: number;
  cpm: number[];
}
type Ms = number;

export const replayMetrics = (
  replay: readonly ReplayRecord[],
  gameDuration: Ms,
  samplingInterval: Ms,
): ReplayMetrics => {
  if (replay.length === 0) return { accuracy: 0, cpm: [] };

  let mistakes = 0;

  const cpm: number[] = Array.from(
    { length: Math.ceil(gameDuration / samplingInterval) },
    () => 0,
  );

  for (const r of replay) {
    if (r.correct) {
      ++cpm[Math.floor(r.timestamp / samplingInterval)];
    } else {
      ++mistakes;
    }
  }

  for (let n = 0; n < cpm.length - 1; ++n) {
    cpm[n] *= 60000 / samplingInterval;
  }

  if (cpm[cpm.length - 1] > 0) {
    cpm[cpm.length - 1] *= 60000 / (gameDuration % samplingInterval);
  } else {
    const zeroTail =
      cpm.length -
      Math.floor(replay[replay.length - 1].timestamp / samplingInterval) -
      1;

    cpm.splice(-zeroTail);
  }

  return { accuracy: 1 - mistakes / Math.max(1, replay.length), cpm };
};
