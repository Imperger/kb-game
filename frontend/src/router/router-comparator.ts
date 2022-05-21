import { Location, Route } from 'vue-router/types/router';

export const isRoutesEqual = <T extends string | Location> (a: T, b: T): boolean => {
  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a === 'string' || typeof b === 'string') {
    return a === b;
  }

  if (typeof a.name === 'string' && typeof b.name === 'string') {
    return a.name === b.name;
  }

  if (typeof a.path === 'string' && typeof b.path === 'string') {
    return a.path === b.path;
  }

  return false;
};

export const toLocation = (r: Route): Location => ({ ...r, name: r.name ?? '' });
