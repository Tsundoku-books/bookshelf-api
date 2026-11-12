import { databaseSsl } from '../../../src/config/ssl';

describe('databaseSsl', () => {
  it('encrypts without verifying the server when no CA is configured', () => {
    expect(databaseSsl()).toEqual({ rejectUnauthorized: false });
  });

  it('verifies the server against the configured CA, restoring escaped newlines', () => {
    expect(databaseSsl('-----BEGIN CERTIFICATE-----\nABC\n-----END CERTIFICATE-----')).toEqual({
      ca: '-----BEGIN CERTIFICATE-----\nABC\n-----END CERTIFICATE-----',
      rejectUnauthorized: true,
    });
  });
});
