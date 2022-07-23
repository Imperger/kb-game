export interface RejectedResponse {
  rejectedResponse: true;
  code: number;
  message?: string;
}

export const isRejectedResponse =
    (response: unknown): response is RejectedResponse => (response as RejectedResponse)?.rejectedResponse === true;
