export function isValidDate<T>(value: T) {
  return value instanceof Date && isFinite(value as any);
}
