import { createParamDecorator } from '@nestjs/common';

interface Envelope {
  alg: string;
  kid: string;
  type: string;
}

interface Payload {
  aud: string;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  family_name: string;
  given_name: string;
  iat: number;
  iss: string;
  jti: string;
  name: string;
  nbf: number;
  picture: string;
  sub: string;
}

export interface GoogleIdTokenDecoded {
  envelope: Envelope;
  payload: Payload;
}

export const GoogleIdToken = createParamDecorator((data, req): GoogleIdTokenDecoded => {
  return req.getArgByIndex(0).credentials;
});
