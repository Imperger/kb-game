import ms from 'ms';

type milliseconds = number;
type duration = string;

export function timeDiff(a: Date, b: Date): milliseconds;
export function timeDiff(a: Date, b: milliseconds): Date;
export function timeDiff(a: Date, b: duration): Date;

export function timeDiff<S extends Date | milliseconds | duration>(
  a: Date,
  b: S
): milliseconds | Date {
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
