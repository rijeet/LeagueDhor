import { config } from 'dotenv';

// Load environment variables for tests
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods in tests to reduce noise (optional)
// Uncomment if you want to suppress console output in tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
