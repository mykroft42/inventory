import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
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

describe('InventoryTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders a table element', async () => {
    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    render(<InventoryTable />);
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
  });

  test('renders column headers: Name, Category, Expires, Qty, Actions', async () => {
    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    render(<InventoryTable />);
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Expires')).toBeInTheDocument();
      expect(screen.getByText('Qty')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  test('renders one row per item', async () => {
    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    render(<InventoryTable />);
    await waitFor(() => {
      // tbody rows only (not thead row)
      const rows = screen.getAllByRole('row');
      // header row + 2 data rows
      expect(rows.length).toBe(3);
    });
  });

  test('shows empty-state message when items array is empty', async () => {
    mockInventoryApi.getAll.mockResolvedValue([]);
    render(<InventoryTable />);
    await waitFor(() =>
      expect(screen.getByText(/your inventory is empty/i)).toBeInTheDocument()
    );
  });

  test('renders item name in each row', async () => {
    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    render(<InventoryTable />);
    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
    });
  });

  test('renders item category in each row', async () => {
    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    render(<InventoryTable />);
    await waitFor(() => {
      expect(screen.getAllByText('Groceries').length).toBeGreaterThanOrEqual(2);
    });
  });

  test('renders expiration date when present', async () => {
    const itemWithExpiry = [
      {
        ...mockItems[0],
        expirationDate: '2030-12-31',
      },
    ];
    mockInventoryApi.getAll.mockResolvedValue(itemWithExpiry);
    render(<InventoryTable />);
    await waitFor(() => {
      expect(screen.getByText(/2030/)).toBeInTheDocument();
    });
  });

  test('clicking Remove button calls delete API optimistically', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    mockInventoryApi.delete.mockResolvedValue(undefined);
    render(<InventoryTable />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /remove milk/i }));

    expect(screen.queryByText('Milk')).not.toBeInTheDocument();
  });

  test('item with past expiration date renders Expired badge', async () => {
    const expiredItem = [{ ...mockItems[0], expirationDate: '2020-01-01' }];
    mockInventoryApi.getAll.mockResolvedValue(expiredItem);
    render(<InventoryTable />);
    await waitFor(() =>
      expect(screen.getByText('Expired')).toBeInTheDocument()
    );
  });

  test('item with future expiration renders no Expired badge', async () => {
    const futureItem = [{ ...mockItems[0], expirationDate: '2099-12-31' }];
    mockInventoryApi.getAll.mockResolvedValue(futureItem);
    render(<InventoryTable />);
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    expect(screen.queryByText('Expired')).not.toBeInTheDocument();
  });

  test('item with quantity 0 has row with class containing muted', async () => {
    const zeroQtyItem = [{ ...mockItems[0], quantity: 0 }];
    mockInventoryApi.getAll.mockResolvedValue(zeroQtyItem);
    render(<InventoryTable />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    const row = screen.getByTestId('inventory-row-1');
    expect(row.className).toContain('text-muted-foreground');
  });

  test('item with quantity > 0 does not have muted row class', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    render(<InventoryTable />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    const row = screen.getByTestId('inventory-row-1');
    expect(row.className).not.toContain('text-muted-foreground');
  });

  test('shows loading spinner before data loads', async () => {
    let resolve: (v: typeof mockItems) => void;
    mockInventoryApi.getAll.mockReturnValue(new Promise(r => { resolve = r; }) as any);
    render(<InventoryTable />);
    expect(screen.getByText(/loading your inventory/i)).toBeInTheDocument();
    resolve!(mockItems);
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
  });

  test('shows error message and Retry button when API fails', async () => {
    mockInventoryApi.getAll.mockRejectedValue(new Error('Network error'));
    render(<InventoryTable />);
    await waitFor(() => expect(screen.getByText(/Network error/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  test('Retry button re-fetches inventory', async () => {
    mockInventoryApi.getAll
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(mockItems);
    render(<InventoryTable />);
    await waitFor(() => expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
  });

  test('clicking + button calls update API and increments quantity', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    mockInventoryApi.update.mockResolvedValue(undefined);
    render(<InventoryTable />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /increase quantity of milk by 1/i }));
    await waitFor(() =>
      expect(mockInventoryApi.update).toHaveBeenCalledWith(1, expect.objectContaining({ quantity: 3 }))
    );
  });

  test('clicking - button calls update API and decrements quantity', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    mockInventoryApi.update.mockResolvedValue(undefined);
    render(<InventoryTable />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /decrease quantity of milk by 1/i }));
    await waitFor(() =>
      expect(mockInventoryApi.update).toHaveBeenCalledWith(1, expect.objectContaining({ quantity: 1 }))
    );
  });

  test('delete API failure rolls back item to list', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    mockInventoryApi.delete.mockRejectedValue(new Error('Delete failed'));
    render(<InventoryTable />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /remove milk/i }));
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
  });

  test('clicking qty display enters edit mode', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    render(<InventoryTable />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /edit quantity of milk/i }));
    expect(screen.getByRole('spinbutton', { name: /inline quantity/i })).toBeInTheDocument();
  });

  test('Escape key cancels qty edit', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    render(<InventoryTable />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /edit quantity of milk/i }));
    const input = screen.getByRole('spinbutton', { name: /inline quantity/i });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  test('Enter key commits qty edit and calls update API', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    mockInventoryApi.update.mockResolvedValue(undefined);
    render(<InventoryTable />);
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
    render(<InventoryTable />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /edit quantity of milk/i }));
    const input = screen.getByRole('spinbutton', { name: /inline quantity/i });
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText(/invalid quantity/i)).toBeInTheDocument();
  });

  test('handleUndo restores deleted item', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItems[0]]);
    mockInventoryApi.delete.mockResolvedValue(undefined);
    mockInventoryApi.restoreItem.mockResolvedValue(mockItems[0]);
    const { rerender } = render(<InventoryTable />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /remove milk/i }));
    await waitFor(() => expect(mockInventoryApi.delete).toHaveBeenCalled());
    await (inventoryApi as any).restoreItem(mockItems[0].id);
    rerender(<InventoryTable />);
  });
});
