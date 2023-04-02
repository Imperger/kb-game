import { X509Certificate } from 'crypto';
import { readFile } from 'fs/promises';

import { Certificates, OAuth2Client } from 'google-auth-library';
import { PublicKeys } from 'google-auth-library/build/src/auth/oauth2client';

export async function setupTestEnvironment(): Promise<void> {
  const certFilename = process.env.TEST_GOOGLE_IDENTITY_CERT;
  if (certFilename) {
    try {
      const cert = await readFile(certFilename, { encoding: 'utf-8' });
      const parsedCert = new X509Certificate(cert);
      const kid = parsedCert.fingerprint.replace(/:/g, '').toLowerCase();

      // Inject self signed cert that make possible accepts self signed idTokens
      const verifySignedJwtWithCertsAsync =
        OAuth2Client.prototype.verifySignedJwtWithCertsAsync;
      OAuth2Client.prototype.verifySignedJwtWithCertsAsync = async (
        jwt: string,
        certs: Certificates | PublicKeys,
        requiredAudience?: string | string[],
        issuers?: string[],
        maxExpiry?: number
      ) => {
        return verifySignedJwtWithCertsAsync(
          jwt,
          { ...certs, [kid]: cert },
          requiredAudience,
          issuers,
          maxExpiry
        );
      };
    } catch (e) {
      // Missing or invalid certificate
    }
  }
}
