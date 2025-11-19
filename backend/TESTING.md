# Testing Guide

This document explains how to run tests for the NestJS backend.

## Test Structure

```
backend/
├── src/
│   ├── **/*.spec.ts          # Unit tests
│   └── ...
├── test/
│   ├── e2e/
│   │   └── *.e2e-spec.ts     # Integration tests
│   ├── helpers/
│   │   └── mocks.ts          # Test mocks and helpers
│   └── setup.ts              # Test setup
└── coverage/                  # Coverage reports
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:cov
```

Coverage report will be generated in `coverage/` directory. Open `coverage/index.html` in browser for detailed report.

## Test Coverage Requirements

Minimum coverage thresholds:
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

## Writing Tests

### Unit Tests

Unit tests test individual components in isolation with mocked dependencies.

Example:
```typescript
describe('UserService', () => {
  let service: UserService;
  let databaseService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should return user data', async () => {
    // Test implementation
  });
});
```

### Integration Tests

Integration tests test the full application with real dependencies (requires MySQL and Redis).

Example:
```typescript
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/api/user-data (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/user-data')
      .expect(200);
  });
});
```

## Test Utilities

### Mock Helpers

Located in `test/helpers/mocks.ts`:
- `mockUserData` - Mock user data
- `mockRedisClient` - Mock Redis client
- `mockMysqlPool` - Mock MySQL pool
- `createMockAuthHeaders()` - Create valid auth headers for testing

### Usage

```typescript
import { mockUserData, createMockAuthHeaders } from '../../test/helpers/mocks';

const headers = createMockAuthHeaders();
const userData = mockUserData;
```

## Best Practices

1. **Test Isolation:** Each test should be independent
2. **Mock Dependencies:** Use mocks for external services (DB, Redis)
3. **Test Edge Cases:** Test error conditions, null values, etc.
4. **Clear Test Names:** Use descriptive test names
5. **Arrange-Act-Assert:** Structure tests clearly
6. **Coverage:** Aim for >70% coverage on critical paths

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests

See `.github/workflows/test.yml` for CI configuration.

## Troubleshooting

### Tests Failing

1. **Check environment variables:** Ensure test env vars are set
2. **Check dependencies:** Run `npm install`
3. **Check database/Redis:** Integration tests require running services
4. **Clear cache:** Run `npm test -- --clearCache`

### Coverage Low

1. **Add tests for untested code paths**
2. **Check coverage report:** `coverage/index.html`
3. **Focus on critical paths first**

## Example Test Scenarios

### Authentication Tests
- ✅ Valid headers
- ✅ Missing headers
- ✅ Invalid signature
- ✅ Expired timestamp
- ✅ Future timestamp

### User Service Tests
- ✅ Cache hit
- ✅ Cache miss
- ✅ Database fetch
- ✅ User not found
- ✅ Error handling

### Database Tests
- ✅ Successful query
- ✅ User not found
- ✅ JSON parsing
- ✅ Invalid JSON handling
- ✅ Connection errors

### Redis Tests
- ✅ Cache get/set
- ✅ Lock acquire/release
- ✅ Error handling
- ✅ TTL expiration

---

**Last Updated:** November 2025

