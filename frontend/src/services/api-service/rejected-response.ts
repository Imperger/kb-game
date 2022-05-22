export interface RejectedResponse {
  code: number;
  message?: string;
}

export const isRejectedResponse =
    (response: unknown): response is RejectedResponse => typeof (response as RejectedResponse).code === 'number';
