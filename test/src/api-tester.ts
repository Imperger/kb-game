import { AxiosError, AxiosResponse } from "axios";

import { isAxiosError } from "./guards/axios-error-guard";
import { isPromise } from "./guards/is-promise-guard";
import { Logger } from "./logger";
import { isTestError, TestError } from "./test-error";

export interface Case<T> {
    If: (response: T) => boolean | Promise<boolean>;
    Done?: (response: T) => string | Promise<string>;
    Throw?: (response: T) => string | Promise<string>;
}

export interface Brnaches<T> {
    done?: Case<AxiosResponse<T>>[];
    error?: Case<AxiosError<T>>[];
}

export class ApiTester {
    constructor(
        private logger: Logger,
        private domain: string) { }

    async test<T>(fn: () => Promise<AxiosResponse<T>>, branches: Brnaches<T>): Promise<boolean> {
        try {
            const r = await fn();

            if (!branches?.done?.length) {
                throw new TestError('None of the conditions matched', this.domain);
            }

            for (const c of branches.done) {
                if (isPromise(c.If) ? await c.If(r) : c.If(r)) {
                    return this.executeCondition(c, r);
                }
            }

            throw new TestError('None of the conditions matched', this.domain);
        } catch (e) {
            if (isAxiosError<T>(e)) {
                if (!branches?.error?.length) {
                    throw new TestError('None of the conditions matched', this.domain);
                }

                for (const c of branches.error) {
                    if (isPromise(c.If) ? await c.If(e) : c.If(e)) {
                        return this.executeCondition(c, e);
                    }
                }

                throw new TestError('None of the conditions matched', this.domain);
            } else if (isTestError(e)) {
                throw e;
            }

            throw new TestError('Caught unexpected error type', this.domain);
        }
    }

    private async executeCondition<T>(c: Case<T>, r: T): Promise<boolean> {
        if (c.Done) {
            this.logger.log(isPromise(c.Done) ? await c.Done(r) : c.Done(r) as string);
            return true;
        } else if (c.Throw) {
            this.logger.error(isPromise(c.Done) ? await c.Throw(r) : c.Throw(r) as string);
            return false;
        } else {
            throw new TestError('Missing condition action', this.domain);
        }

    }
}