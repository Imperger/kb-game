import { RejectedResponse } from "src/common/types/rejected-response";

export const spawnerUnknownError: RejectedResponse = { code: 1, message: 'Unknown error' };
export const spawnerHostNotResponse: RejectedResponse = { code: 2, message: 'Can\'t connect to host' };
export const spawnerHostNotFound: RejectedResponse = { code: 3, message: 'Can\'t resolve host address' };
export const spawnerWrongSecret: RejectedResponse = { code: 4, message: 'Wront secret' };