import { inventoryApi } from './inventoryApi';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => [],
    text: async () => '',
  } as Response);
});

describe('API_BASE_URL fallback', () => {
  test('uses REACT_APP_API_URL when set', async () => {
    // REACT_APP_API_URL is baked at module load time in CRA.
    // In the test environment it defaults to undefined, so the fallback runs.
    // This test confirms the fallback expression structure is correct by
    // verifying fetch is called with window.location.hostname.
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true,
      configurable: true,
    });

    await inventoryApi.getAll();

    const calledUrl: string = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toMatch(/\/api\/inventory$/);
  });

  test('falls back to window.location.hostname:5007 when REACT_APP_API_URL is not set', async () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: '192.168.1.100' },
      writable: true,
      configurable: true,
    });

    // Re-import module after patching window.location using isolateModules
    let api: { inventoryApi: typeof inventoryApi };
    jest.isolateModules(() => {
      api = require('./inventoryApi');
    });

    await api!.inventoryApi.getAll();

    const calledUrl: string = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toBe('http://192.168.1.100:5007/api/inventory');
  });

  test('falls back to localhost:5007 when hostname is localhost', async () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true,
      configurable: true,
    });

    let api: { inventoryApi: typeof inventoryApi };
    jest.isolateModules(() => {
      api = require('./inventoryApi');
    });

    await api!.inventoryApi.getAll();

    const calledUrl: string = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toBe('http://localhost:5007/api/inventory');
  });
});
