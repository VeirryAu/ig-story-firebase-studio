/**
 * Authentication and Authorization Utilities
 * Handles header validation and date restrictions
 */

/**
 * Validates authentication headers for production
 * @param headers - Request headers object
 * @returns { valid: boolean, error?: string }
 */
export function validateAuthHeaders(headers: Headers | Record<string, string | null>): { valid: boolean; error?: string } {
  // Skip validation in development
  if (process.env.NODE_ENV === 'development') {
    return { valid: true };
  }

  const timestamp = headers.get?.('timestamp') || (headers as any).timestamp;
  const userId = headers.get?.('user_id') || (headers as any).user_id;
  const sign = headers.get?.('sign') || (headers as any).sign;

  // Check if all required headers are present
  if (!timestamp || !userId || !sign) {
    return {
      valid: false,
      error: 'Missing required headers: timestamp, user_id, or sign',
    };
  }

  // Validate timestamp format and expiration (max 10 minutes)
  try {
    const requestTime = new Date(timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - requestTime.getTime()) / (1000 * 60);

    if (isNaN(requestTime.getTime())) {
      return {
        valid: false,
        error: 'Invalid timestamp format',
      };
    }

    if (diffMinutes > 10 || diffMinutes < -10) {
      return {
        valid: false,
        error: 'Timestamp expired or too far in future (max 10 minutes)',
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid timestamp format',
    };
  }

  // Validate signature
  const expectedSign = btoa(`${timestamp}forecap2025${userId}`);
  if (sign !== expectedSign) {
    return {
      valid: false,
      error: 'Invalid signature',
    };
  }

  return { valid: true };
}

/**
 * Checks if the current date is before the expiration date (Dec 31, 2025)
 * @returns { valid: boolean, error?: string }
 */
export function checkDateRestriction(): { valid: boolean; error?: string } {
  // Skip date restriction in development
  if (process.env.NODE_ENV === 'development') {
    return { valid: true };
  }

  const expirationDate = new Date('2025-12-31T23:59:59.999Z');
  const now = new Date();

  if (now > expirationDate) {
    return {
      valid: false,
      error: 'This content is no longer available after December 31, 2025',
    };
  }

  return { valid: true };
}

/**
 * Validates both authentication and date restriction
 * @param headers - Request headers
 * @returns { valid: boolean, error?: string }
 */
export function validateAccess(headers?: Headers | Record<string, string | null>): { valid: boolean; error?: string } {
  // Check date restriction first
  const dateCheck = checkDateRestriction();
  if (!dateCheck.valid) {
    return dateCheck;
  }

  // Check authentication if headers provided
  if (headers) {
    const authCheck = validateAuthHeaders(headers);
    if (!authCheck.valid) {
      return authCheck;
    }
  }

  return { valid: true };
}

