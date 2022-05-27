import { HttpException, HttpStatus } from "@nestjs/common";

export interface RejectedResponse {
  code: number;
  message?: string;
}
  
export class RejectedResponseException extends HttpException {
  constructor (payload: RejectedResponse) { super(payload, HttpStatus.BAD_REQUEST); }
}
  