const SIGNATURE_SECRET = process.env.AUTH_SIGNATURE_SECRET ?? '';

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

  // --- Define Tolerance Boundary ---
  const MAX_AGE_MINUTES = 10;   // Request cannot be older than 10 minutes.
  const SKEW_TOLERANCE_MINUTES = 2; // Allows the client's clock to be up to 2 minutes fast.

  if (isNaN(diffMinutes)) {
      // Fails if the timestamp string is completely invalid (returns NaN)
      return { valid: false, error: 'Invalid timestamp format' };
  }

  // Check 1: Too Old (More than 10 minutes in the past)
  if (diffMinutes > MAX_AGE_MINUTES) {
      return {
          valid: false,
          error: `Expired. Request is ${diffMinutes.toFixed(2)} minutes old (Max: 10m)`,
      };
  }

  // Check 2: Too Fast (More than 2 minutes in the future)
  if (diffMinutes < -SKEW_TOLERANCE_MINUTES) {
      return {
          valid: false,
          error: `Invalid. Client clock is ${Math.abs(diffMinutes).toFixed(2)} minutes fast (Max Skew: 2m)`,
      };
  }

  // Validate signature (base64(timestamp + [secret] + user_id))
  const payload = SIGNATURE_SECRET
    ? `${timestamp}${SIGNATURE_SECRET}${user_id}`
    : `${timestamp}${user_id}`;
  const expectedSign = Buffer.from(payload, 'utf-8').toString(
    'base64',
  );

  if (sign !== expectedSign) {
    return {
      valid: false,
      error: 'Invalid signature',
    };
  }

  return { valid: true };
}

