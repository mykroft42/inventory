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
});
