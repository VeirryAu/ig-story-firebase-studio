// Test setup file
// This runs before all tests

// Mock environment variables
process.env.MYSQL_HOST = 'localhost';
process.env.MYSQL_DATABASE = 'test_db';
process.env.MYSQL_USER = 'test_user';
process.env.MYSQL_PASSWORD = 'test_password';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.AUTH_SIGNATURE_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
jest.setTimeout(30000);

