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

const interpolateToPerMinute = (samples: number[], samplingInterval: number) =>
  samples.map((x) => (x * 60000) / samplingInterval);

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

  return {
    accuracy: 1 - mistakes / Math.max(1, replay.length),
    cpm: interpolateToPerMinute(samples, samplingInterval),
  };
};
