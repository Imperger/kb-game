export interface ReplayRecord {
  char: string;
  correct: boolean;
  timestamp: number;
}

export interface ReplayMetrics {
  accuracy: number;
  avgCpm: number;
  cpm: number[];
}
type Ms = number;

const OneMinute = 60000;

const interpolateToPerMinute = (samples: number[], samplingInterval: number) =>
  samples.map((x) => x * (OneMinute / samplingInterval));

export const replayMetrics = (
  replay: readonly ReplayRecord[],
  finished: boolean,
  gameDuration: Ms,
  samplingInterval: Ms,
): ReplayMetrics => {
  if (replay.length === 0) return { accuracy: 0, avgCpm: 0, cpm: [] };

  let mistakes = 0;

  const playTime = finished
    ? replay[replay.length - 1].timestamp
    : gameDuration;

  const samples: number[] = Array.from(
    {
      length: Math.ceil(playTime / samplingInterval),
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
    avgCpm: (replay.length - mistakes) * (OneMinute / playTime),
    cpm: interpolateToPerMinute(samples, samplingInterval),
  };
};
