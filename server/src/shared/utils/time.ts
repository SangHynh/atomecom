import ms, { type StringValue } from 'ms';

/**
 * Converts duration string to seconds, or calculates remaining seconds from a future timestamp.
 * Use case: Syncing JWT expiresIn with an existing session expiration.
 */
export const getExpiresInSeconds = (
  expiresInConfig: string,
  expiresAt?: number,
): number => {
  // if expiresAt is provided, calculate remaining seconds
  if (expiresAt) {
    const remainingMs = expiresAt - Date.now();
    return Math.max(1, Math.floor(remainingMs / 1000));
  }

  // if no expiresAt is provided, calculate seconds from expiresIn
  const milliseconds = ms(expiresInConfig as StringValue);
  if (!milliseconds) return 0;
  return Math.floor(milliseconds / 1000);
};

/**
 * Calculates a future expiration timestamp in milliseconds.
 */
export const getExpiresAt = (expiresIn: string): number => {
  const milliseconds = ms(expiresIn as StringValue);
  return Date.now() + (milliseconds || 0);
};
