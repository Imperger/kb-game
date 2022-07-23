export class AppException {
  public readonly code: number;
  public readonly status: number;
  public readonly message: string;
}

export interface CodeRange {
  min: number;
  max: number;
}

export function exceptionGuardFactory<T extends AppException, TArgs extends any[]>(derived: { new (...args: TArgs): T }, code: CodeRange) {
  return (e: AppException): e is T => e instanceof derived && e.code >= code.min && e.code < code.max;
}
