import ms from 'ms';

import { Milliseconds } from '../duration';

type duration = string;

export function timeDiff(a: Date, b: Date): Milliseconds;
export function timeDiff(a: Date, b: Milliseconds): Date;
export function timeDiff(a: Date, b: duration): Date;

export function timeDiff<S extends Date | Milliseconds | duration>(
  a: Date,
  b: S
): Milliseconds | Date {
  const m = a.getTime();

  if (b instanceof Date) {
    return m - b.getTime();
  }

  if (typeof b === 'number') {
    return new Date(m - b);
  }

  if (typeof b === 'string') {
    return new Date(m - ms(b));
  }

  throw new Error('Unknown type argument passed');
}
