import assert, { AssertionError } from 'node:assert';
import { AxiosResponse } from "axios";

import { isAxiosError } from "./guards/axios-error-guard";
import { Logger } from "./logger";

type Range<
    N extends number,
    Result extends Array<unknown> = [],
    > =
    (Result['length'] extends N
        ? Result
        : Range<N, [...Result, Result['length']]>
    )

type SuccessCode = Exclude<Range<300>[number], Range<200>[number]>;

type Diff = string;

export interface ApiTestResult<T> {
    data: T;
    pass: boolean;
}

export interface FailType<T> {
    type: T;
}

export class ApiTester {
    constructor(private logger: Logger) { }

    test<TSuccess, TFail>(fn: () => (Promise<AxiosResponse<TSuccess>> | FailType<TFail>), desc: string) {
        class StatusSetter {
            constructor(private logger: Logger, private desc: string) { }
            status<TStatus extends SuccessCode | number, TResponse = TStatus extends SuccessCode ? TSuccess : TFail>(code: TStatus) {
                return new ResponseSetter<TResponse>(code, this.logger, this.desc);
            }
        }

        class ResponseSetter<TResponse> {
            private empty = Symbol('no_response_reference');
            private ref: TResponse | ((x: TResponse) => boolean) | Symbol = this.empty;

            constructor(private status: number, private logger: Logger, private desc: string) { }

            response(value: TResponse | ((x: TResponse) => boolean)) {
                this.ref = value;
                return this;
            }

            async toPromise(): Promise<ApiTestResult<TResponse>> {
                const response = { status: 0, data: {} as TResponse };
                try {
                    const r = await fn() as AxiosResponse<unknown>;
                    response.status = r.status;
                    response.data = r.data as TResponse;
                } catch (e) {
                    if (isAxiosError(e)) {
                        response.status = e.response?.status ?? -1;
                        response.data = e.response?.data as TResponse;
                    }
                }

                let pass = false;

                if (response.status === this.status) {
                    const compResult = this.compareResponse(response.data);
                    if (compResult === true) {
                        pass = true;
                        this.logger.log(`PASS ${this.desc}`);
                    } else if (compResult === false) {
                        this.logger.error(`FAIL ${this.desc}. Bad payload`);
                    } else {
                        this.logger.error(`FAIL ${this.desc}. Diff:\n${compResult}`);
                    }
                } else {
                    this.logger.error(`FAIL ${this.desc}. The status code mismatch, expected '${this.status}' but given '${response.status}'`);
                }

                return { data: response.data, pass };
            }

            private compareResponse(data: unknown): boolean | Diff {
                if (this.ref === this.empty)
                    return true;

                if (typeof this.ref === 'function') {
                    return (this.ref as Function)(data);
                } else {
                    try {
                        assert.deepStrictEqual(data, this.ref);
                        return true;
                    } catch (e) {
                        return (e as AssertionError).message;
                    }
                }
            }
        }

        return new StatusSetter(this.logger, desc);
    }
}
