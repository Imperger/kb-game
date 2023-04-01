import { readFile } from 'fs/promises';
import { X509Certificate, randomBytes } from 'crypto';

import jwt from 'jsonwebtoken';

export interface IdToken {
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

export enum DateModifier {
  Expired,
  Valid,
  NotValidBefore
}

export class GoogleIdentity {
  private kid = '';

  private key = '';

  public async init(): Promise<void> {
    await this.loadGoogleIdentityCertAndKey();
  }

  public signIdToken(token: IdToken): string {
    return jwt.sign(token, this.key, { algorithm: 'RS256', keyid: this.kid });
  }

  public signIdTokenAndModifyDate(token: IdToken, dateMod: DateModifier): string {
    const now = Math.round(Date.now() / 1000);

    const oneDay = 86400;
    
    let nbf = 0;
    let iat = 0;
    let exp = 0;

    switch(dateMod) {
      case DateModifier.Expired:
        ({ nbf, iat, exp } = GoogleIdentity.adjustTimestamps(now - oneDay));
        break;

      case DateModifier.Valid:
        ({ nbf, iat, exp } = GoogleIdentity.adjustTimestamps(now));
        break;

      case DateModifier.NotValidBefore:
        ({ nbf, iat, exp } = GoogleIdentity.adjustTimestamps(now + oneDay));
        break;
    }

    return this.signIdToken({ ...token, nbf, iat, exp });
  }

  public signIdTokenAndSetInvalidAudiene(token: IdToken): string {
    const aud = randomBytes(8).toString('hex');
    return this.signIdToken({ ...token, aud, azp: aud });
  }

  private async loadGoogleIdentityCertAndKey() {
    const certFilename = process.env.GOOGLE_IDENTITY_CERT;
    const keyFilename = process.env.GOOGLE_IDENTITY_KEY;

    if (!certFilename) {
      throw new Error('Missing GOOGLE_IDENTITY_CERT');
    }

    if (!keyFilename) {
      throw new Error('Missing GOOGLE_IDENTITY_KEY');
    }

    const certStr = await readFile(certFilename, { encoding: 'utf-8' });
    const cert = new X509Certificate(certStr);
    this.kid = cert.fingerprint.replace(/:/g, '').toLowerCase();

    this.key = await readFile(keyFilename, { encoding: 'utf-8' });
  }

  private static adjustTimestamps(iat: number) {
    const nbfOffset = -300;
    const expirationOffset = 3600;

    return {
      nbf: iat + nbfOffset,
      iat,
      exp: iat + expirationOffset
    };
  }
}
