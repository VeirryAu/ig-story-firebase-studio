// Test mocks and helpers

export const mockUserData = {
  user_id: 12345,
  userName: 'Test User',
  trxCount: 10,
  variantCount: 5,
  totalPoint: 1000,
  totalPointDescription: 'Test points',
  totalPointPossibleRedeem: 500,
  totalPointImage: 'https://example.com/image.jpg',
  deliveryCount: 3,
  pickupCount: 7,
  cheaperSubsDesc: 'Test subscription',
  cheaperSubsAmount: 99.99,
  topRanking: 1,
  listCircularImages: [{ url: 'https://example.com/img1.jpg' }],
  listProductFavorite: [{ id: 1, name: 'Product 1' }],
  listFavoriteStore: [{ id: 1, name: 'Store 1' }],
};

export const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  ping: jest.fn(),
  exists: jest.fn(),
};

export const mockMysqlPool = {
  getConnection: jest.fn(),
  query: jest.fn(),
  execute: jest.fn(),
  end: jest.fn(),
};

export const mockMysqlConnection = {
  execute: jest.fn(),
  query: jest.fn(),
  release: jest.fn(),
};

export const createMockAuthHeaders = (overrides = {}) => {
  const timestamp = new Date().toISOString();
  const user_id = '12345';
  const sign = Buffer.from(`${timestamp}test_secret${user_id}`, 'utf-8').toString('base64');
  
  return {
    timestamp,
    user_id,
    sign,
    ...overrides,
  };
};

