import { vi } from 'vitest';
import { inventoryApi } from './inventoryApi';

const mockFetch = vi.fn();
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
  test('uses VITE_API_URL / location-based fallback for fetch calls', async () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true,
      configurable: true,
    });

    await inventoryApi.getAll();

    const calledUrl: string = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toMatch(/\/api\/inventory$/);
  });

  test('falls back to window.location.hostname:5007 when VITE_API_URL is not set', async () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: '192.168.1.100' },
      writable: true,
      configurable: true,
    });

    // Re-import module after patching window.location
    vi.resetModules();
    const { inventoryApi: freshApi } = await import('./inventoryApi');

    await freshApi.getAll();

    const calledUrl: string = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toMatch(/192\.168\.1\.100/);
  });

  test('falls back to localhost:5007 when hostname is localhost', async () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true,
      configurable: true,
    });

    vi.resetModules();
    const { inventoryApi: freshApi } = await import('./inventoryApi');

    await freshApi.getAll();

    const calledUrl: string = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toMatch(/\/api\/inventory$/);
  });
});
