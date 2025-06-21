import '@testing-library/jest-dom';

// Mock crypto.randomUUID for tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2),
  },
});

// Mock window.location for navigation tests
const mockLocation = {
  hash: '#/',
  pathname: '/',
  search: '',
  origin: 'http://localhost:3000',
  href: 'http://localhost:3000/',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock window.history for navigation tests
const mockHistory = {
  pushState: jest.fn(),
  replaceState: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  go: jest.fn(),
};

Object.defineProperty(window, 'history', {
  value: mockHistory,
  writable: true,
});

// Mock addEventListener and removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockLocation.hash = '#/';
  mockLocation.pathname = '/';
  mockLocation.search = '';
});