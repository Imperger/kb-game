import { Buffer } from 'node:buffer';

export class Base64 {
  public static encodeString(str: string): string {
    return Buffer.from(str).toString('base64url');
  }

  public static decodeString(base64: string): string {
    return Buffer.from(base64, 'base64url').toString('utf-8');
  }
}
