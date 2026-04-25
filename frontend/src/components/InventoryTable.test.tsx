import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import InventoryTable from './InventoryTable';
import { inventoryApi } from '../services/inventoryApi';

vi.mock('../services/inventoryApi');
const mockInventoryApi = inventoryApi as ReturnType<typeof vi.mocked<typeof inventoryApi>>;

const mockItems = [
  {
    id: 1,
    name: 'Milk',
    quantity: 2,
    category: 'Groceries' as const,
    expirationDate: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Bread',
    quantity: 1,
    category: 'Groceries' as const,
    expirationDate: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

function renderTable() {
  return render(
    <MemoryRouter>
      <InventoryTable />
    </MemoryRouter>
  );
}

describe('InventoryTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders a table element', async () => {
    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    renderTable();
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
  });

  test('renders column headers: Name, Category, Qty', async () => {
    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    renderTable();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Qty')).toBeInTheDocument();
      expect(screen.queryByText('Expires')).not.toBeInTheDocument();
      expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    });
  });

  test('renders one row per item', async () => {
    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    renderTable();
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(3);
    });
  });

  test('shows empty-state message when items array is empty', async () => {
    mockInventoryApi.getAll.mockResolvedValue([]);
    renderTable();
    await waitFor(() =>
      expect(screen.getByText(/your inventory is empty/i)).toBeInTheDocument()
    );
  });

  test('renders item name in each row', async () => {
    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    renderTable();
    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
    });
  });

  test('renders item category in each row', async () => {
    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    renderTable();
    await waitFor(() => {
      expect(screen.getAllByText('Groceries').length).toBeGreaterThanOrEqual(2);
    });
  });

  test('item with quantity 0 has row with class containing muted', async () => {
    const zeroQtyItem = [{ ...mockItems[0], quantity: 0 }];
    mockInventoryApi.getAll.mockResolvedValue(zeroQtyItem);
    renderTable();
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    const row = screen.getByTestId('inventory-row-1');
    expect(row.className).toContain('text-muted-foreground');
  });

  test('item with quantity > 0 does not have muted row class', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    renderTable();
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    const row = screen.getByTestId('inventory-row-1');
    expect(row.className).not.toContain('text-muted-foreground');
  });

  test('shows loading spinner before data loads', async () => {
    let resolve: (v: typeof mockItems) => void;
    mockInventoryApi.getAll.mockReturnValue(new Promise(r => { resolve = r; }) as any);
    renderTable();
    expect(screen.getByText(/loading your inventory/i)).toBeInTheDocument();
    resolve!(mockItems);
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
  });

  test('shows error message and Retry button when API fails', async () => {
    mockInventoryApi.getAll.mockRejectedValue(new Error('Network error'));
    renderTable();
    await waitFor(() => expect(screen.getByText(/Network error/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  test('Retry button re-fetches inventory', async () => {
    mockInventoryApi.getAll
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(mockItems);
    renderTable();
    await waitFor(() => expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
  });

  test('clicking + button calls update API and increments quantity', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    mockInventoryApi.update.mockResolvedValue(undefined);
    renderTable();
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /increase quantity of milk by 1/i }));
    await waitFor(() =>
      expect(mockInventoryApi.update).toHaveBeenCalledWith(1, expect.objectContaining({ quantity: 3 }))
    );
  });

  test('clicking - button calls update API and decrements quantity', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    mockInventoryApi.update.mockResolvedValue(undefined);
    renderTable();
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /decrease quantity of milk by 1/i }));
    await waitFor(() =>
      expect(mockInventoryApi.update).toHaveBeenCalledWith(1, expect.objectContaining({ quantity: 1 }))
    );
  });

  test('clicking qty display enters edit mode', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    renderTable();
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /edit quantity of milk/i }));
    expect(screen.getByRole('spinbutton', { name: /inline quantity/i })).toBeInTheDocument();
  });

  test('Escape key cancels qty edit', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    renderTable();
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /edit quantity of milk/i }));
    const input = screen.getByRole('spinbutton', { name: /inline quantity/i });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  test('Enter key commits qty edit and calls update API', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    mockInventoryApi.update.mockResolvedValue(undefined);
    renderTable();
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /edit quantity of milk/i }));
    const input = screen.getByRole('spinbutton', { name: /inline quantity/i });
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() =>
      expect(mockInventoryApi.update).toHaveBeenCalledWith(1, expect.objectContaining({ quantity: 5 }))
    );
  });

  test('invalid qty input shows error on Enter', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    renderTable();
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /edit quantity of milk/i }));
    const input = screen.getByRole('spinbutton', { name: /inline quantity/i });
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText(/invalid quantity/i)).toBeInTheDocument();
  });
});

describe('US2 — name link and column removal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('item name renders as a link element', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    renderTable();
    await waitFor(() => screen.getByText('Milk'));
    const link = screen.getByRole('link', { name: 'Milk' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('/inventory/1'));
  });

  test('no Remove button present in table rows', async () => {
    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    renderTable();
    await waitFor(() => screen.getByRole('table'));
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  test('no expiration date column header present', async () => {
    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    renderTable();
    await waitFor(() => screen.getByRole('table'));
    expect(screen.queryByText('Expires')).not.toBeInTheDocument();
  });

  test('no Actions column header present', async () => {
    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    renderTable();
    await waitFor(() => screen.getByRole('table'));
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });
});

describe('US3 — expiry warning indicator', () => {
  const PAST_DATE = '2000-01-01T00:00:00';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('expired item (date ≤ today) shows TriangleAlert icon adjacent to name', async () => {
    const expiredItem = [{ ...mockItems[0], expirationDate: PAST_DATE }];
    mockInventoryApi.getAll.mockResolvedValue(expiredItem);
    renderTable();
    await waitFor(() => screen.getByRole('table'));
    expect(screen.getByLabelText('Expired warning')).toBeInTheDocument();
  });

  test('future-dated item shows no expiry warning icon', async () => {
    const futureItem = [{ ...mockItems[0], expirationDate: '2099-12-31T00:00:00' }];
    mockInventoryApi.getAll.mockResolvedValue(futureItem);
    renderTable();
    await waitFor(() => screen.getByRole('table'));
    expect(screen.queryByLabelText('Expired warning')).not.toBeInTheDocument();
  });

  test('item with no expiration date shows no expiry warning icon', async () => {
    const noDateItem = [{ ...mockItems[0], expirationDate: null }];
    mockInventoryApi.getAll.mockResolvedValue(noDateItem);
    renderTable();
    await waitFor(() => screen.getByRole('table'));
    expect(screen.queryByLabelText('Expired warning')).not.toBeInTheDocument();
  });
});

describe('three-tier sort order', () => {
  const PAST_DATE = '2000-01-01T00:00:00';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('expired stocked items appear before non-expired stocked items', async () => {
    const items = [
      { ...mockItems[0], id: 1, name: 'Apple', quantity: 2, expirationDate: null },
      { ...mockItems[0], id: 2, name: 'Banana', quantity: 1, expirationDate: PAST_DATE },
    ];
    mockInventoryApi.getAll.mockResolvedValue(items);
    renderTable();
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    const rows = screen.getAllByRole('row');
    expect(rows[1].textContent).toContain('Banana');
    expect(rows[2].textContent).toContain('Apple');
  });

  test('zero-quantity items appear after non-expired stocked items', async () => {
    const items = [
      { ...mockItems[0], id: 1, name: 'Apple', quantity: 0, expirationDate: null },
      { ...mockItems[0], id: 2, name: 'Banana', quantity: 5, expirationDate: null },
    ];
    mockInventoryApi.getAll.mockResolvedValue(items);
    renderTable();
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    const rows = screen.getAllByRole('row');
    expect(rows[1].textContent).toContain('Banana');
    expect(rows[2].textContent).toContain('Apple');
  });

  test('full three-tier ordering: expired stocked first, non-expired stocked second, zero-qty last', async () => {
    const items = [
      { ...mockItems[0], id: 1, name: 'Carrots', quantity: 0, expirationDate: null },
      { ...mockItems[0], id: 2, name: 'Apple', quantity: 2, expirationDate: null },
      { ...mockItems[0], id: 3, name: 'Broccoli', quantity: 1, expirationDate: PAST_DATE },
    ];
    mockInventoryApi.getAll.mockResolvedValue(items);
    renderTable();
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    const rows = screen.getAllByRole('row');
    expect(rows[1].textContent).toContain('Broccoli');
    expect(rows[2].textContent).toContain('Apple');
    expect(rows[3].textContent).toContain('Carrots');
  });

  test('items within same tier are sorted alphabetically ascending', async () => {
    const items = [
      { ...mockItems[0], id: 1, name: 'Zebra', quantity: 1, expirationDate: null },
      { ...mockItems[0], id: 2, name: 'Apple', quantity: 1, expirationDate: null },
      { ...mockItems[0], id: 3, name: 'Mango', quantity: 1, expirationDate: null },
    ];
    mockInventoryApi.getAll.mockResolvedValue(items);
    renderTable();
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    const rows = screen.getAllByRole('row');
    expect(rows[1].textContent).toContain('Apple');
    expect(rows[2].textContent).toContain('Mango');
    expect(rows[3].textContent).toContain('Zebra');
  });

  test('alphabetical sort within tier is case-insensitive', async () => {
    const items = [
      { ...mockItems[0], id: 1, name: 'zebra', quantity: 1, expirationDate: null },
      { ...mockItems[0], id: 2, name: 'Apple', quantity: 1, expirationDate: null },
    ];
    mockInventoryApi.getAll.mockResolvedValue(items);
    renderTable();
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    const rows = screen.getAllByRole('row');
    expect(rows[1].textContent).toContain('Apple');
    expect(rows[2].textContent).toContain('zebra');
  });

  test('tier transition: quantity drop to zero moves item to zero-qty tier', async () => {
    const items = [
      { ...mockItems[0], id: 1, name: 'Milk', quantity: 2, expirationDate: null },
      { ...mockItems[0], id: 2, name: 'Eggs', quantity: 1, expirationDate: null },
    ];
    mockInventoryApi.getAll.mockResolvedValue(items);
    mockInventoryApi.update.mockResolvedValue(undefined);
    renderTable();
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /decrease quantity of eggs by 1/i }));
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('Milk');
      expect(rows[2].textContent).toContain('Eggs');
    });
  });
});
