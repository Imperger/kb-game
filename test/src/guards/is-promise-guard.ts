export const isPromise = (x: unknown): x is Promise<unknown> => {
  return (
    typeof x === 'object' && typeof (x as Promise<unknown>).then === 'function'
  );
};
