export class TestError extends Error {
    constructor(msg: string, public where: string) {
        super(msg)
    }
 }

export function isTestError(err: unknown): err is TestError {
    return err instanceof TestError;
}