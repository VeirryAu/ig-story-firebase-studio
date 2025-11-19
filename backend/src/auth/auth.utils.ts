import { createHash } from 'crypto';

export interface AuthHeaders {
  timestamp?: string;
  user_id?: string;
  sign?: string;
}

export interface AuthResult {
  valid: boolean;
  error?: string;
}

export function validateAuthHeaders(headers: AuthHeaders): AuthResult {
  const { timestamp, user_id, sign } = headers;

  if (!timestamp || !user_id || !sign) {
    return {
      valid: false,
      error: 'Missing required headers: timestamp, user_id, sign',
    };
  }

  // Check timestamp (must be within 10 minutes)
  const timestampDate = new Date(timestamp);
  const now = new Date();
  const diffMinutes = (now.getTime() - timestampDate.getTime()) / 1000 / 60;

  if (isNaN(diffMinutes) || diffMinutes < 0 || diffMinutes > 10) {
    return {
      valid: false,
      error: 'Invalid or expired timestamp',
    };
  }

  // Validate signature
  const expectedSign = createHash('sha256')
    .update(timestamp + 'forecap2025' + user_id)
    .digest('base64');

  if (sign !== expectedSign) {
    return {
      valid: false,
      error: 'Invalid signature',
    };
  }

  return { valid: true };
}

