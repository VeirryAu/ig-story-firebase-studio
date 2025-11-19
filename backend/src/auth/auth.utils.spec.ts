import { validateAuthHeaders } from './auth.utils';

describe('AuthUtils', () => {
  const originalSecret = process.env.AUTH_SIGNATURE_SECRET;

  beforeEach(() => {
    process.env.AUTH_SIGNATURE_SECRET = 'test_secret';
  });

  afterEach(() => {
    process.env.AUTH_SIGNATURE_SECRET = originalSecret;
  });

  describe('validateAuthHeaders', () => {
    it('should validate correct headers', () => {
      const timestamp = new Date().toISOString();
      const user_id = '12345';
      const sign = Buffer.from(`${timestamp}test_secret${user_id}`, 'utf-8').toString('base64');

      const result = validateAuthHeaders({
        timestamp,
        user_id,
        sign,
      });

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject missing timestamp', () => {
      const result = validateAuthHeaders({
        timestamp: '',
        user_id: '12345',
        sign: 'test_sign',
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('timestamp');
    });

    it('should reject missing user_id', () => {
      const result = validateAuthHeaders({
        timestamp: new Date().toISOString(),
        user_id: '',
        sign: 'test_sign',
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('user_id');
    });

    it('should reject missing sign', () => {
      const result = validateAuthHeaders({
        timestamp: new Date().toISOString(),
        user_id: '12345',
        sign: '',
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('sign');
    });

    it('should reject expired timestamp (older than 10 minutes)', () => {
      const timestamp = new Date(Date.now() - 11 * 60 * 1000).toISOString(); // 11 minutes ago
      const user_id = '12345';
      const sign = Buffer.from(`${timestamp}test_secret${user_id}`, 'utf-8').toString('base64');

      const result = validateAuthHeaders({
        timestamp,
        user_id,
        sign,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Expired');
    });

    it('should reject invalid signature', () => {
      const timestamp = new Date().toISOString();
      const user_id = '12345';
      const sign = 'invalid_signature';

      const result = validateAuthHeaders({
        timestamp,
        user_id,
        sign,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('signature');
    });

    it('should reject future timestamp (more than 2 minutes)', () => {
      const timestamp = new Date(Date.now() + 3 * 60 * 1000).toISOString(); // 3 minutes in future
      const user_id = '12345';
      const sign = Buffer.from(`${timestamp}test_secret${user_id}`, 'utf-8').toString('base64');

      const result = validateAuthHeaders({
        timestamp,
        user_id,
        sign,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid');
    });
  });
});

