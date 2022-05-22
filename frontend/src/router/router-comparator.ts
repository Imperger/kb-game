import { Location, Route } from 'vue-router/types/router';

const isString = (x: unknown): x is string => {
  return typeof x === 'string';
};

const isLocation = (x: unknown): x is Location => {
  const t = x as Record<string, unknown>;
  return ['name', 'path'].some(x => typeof t[x] === 'string');
};

export const isRoutesEqual = <T extends string | Location>(a: T, b: T): boolean => {
  if (typeof a !== typeof b) {
    return false;
  }

  if (isString(a)) {
    return a === b;
  } else if (isLocation(a) && isLocation(b)) {
    if (typeof a.name === 'string' && typeof b.name === 'string') {
      return a.name === b.name;
    }

    if (typeof a.path === 'string' && typeof b.path === 'string') {
      return a.path === b.path;
    }
  }

  return false;
};

export const toLocation = (r: Route): Location => ({ ...r, name: r.name ?? '' });
