export interface DatabaseSsl {
  ca?: string;
  rejectUnauthorized: boolean;
}

/**
 * Hosted Postgres (Supabase) signs its certificates with its own CA, which Node does not trust by
 * default. With DATABASE_CA_CERT set the server is verified; without it the connection is encrypted
 * but the server's identity is not checked.
 */
export function databaseSsl(caCert?: string): DatabaseSsl {
  if (!caCert) return { rejectUnauthorized: false };
  // Env var managers often store a PEM on one line with literal \n sequences.
  return { ca: caCert.replace(/\n/g, '\n'), rejectUnauthorized: true };
}
