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

  const samples: number[] = Array.from(
    {
      length: Math.ceil(replay[replay.length - 1].timestamp / samplingInterval),
    },
    () => 0,
  );

  for (const r of replay) {
    if (r.correct) {
      ++samples[Math.floor(r.timestamp / samplingInterval)];
    } else {
      ++mistakes;
    }
  }

  for (let n = 0; n < samples.length - 1; ++n) {
    samples[n] *= 60000 / samplingInterval;
  }

  const rem = gameDuration % samplingInterval;
  const realLastSampleInterval = rem === 0 ? samplingInterval : rem;
  samples[samples.length - 1] *= 60000 / realLastSampleInterval;

  return { accuracy: 1 - mistakes / Math.max(1, replay.length), cpm: samples };
};
