import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InventoryList from './InventoryList';
import { inventoryApi } from '../services/inventoryApi';

// Mock the API
jest.mock('../services/inventoryApi');
const mockInventoryApi = inventoryApi as jest.Mocked<typeof inventoryApi>;

const mockItem = {
  id: 1,
  name: 'Milk',
  quantity: 2,
  category: 'Groceries' as const,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

describe('InventoryList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('renders loading state initially', () => {
    mockInventoryApi.getAll.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<InventoryList />);

    expect(screen.getByText('Loading your inventory...')).toBeInTheDocument();
  });

  test('renders inventory items when loaded', async () => {
    const mockItems = [
      {
        id: 1,
        name: 'Milk',
        quantity: 2,
        category: 'Groceries' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Bread',
        quantity: 1,
        category: 'Groceries' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }
    ];

    mockInventoryApi.getAll.mockResolvedValue(mockItems);

    render(<InventoryList />);

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    expect(screen.getByText('Bread')).toBeInTheDocument();
    expect(screen.getByLabelText(/edit quantity of milk, currently 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/edit quantity of bread, currently 1/i)).toBeInTheDocument();
  });

  test('renders error message when API fails', async () => {
    mockInventoryApi.getAll.mockRejectedValue(new Error('Failed to fetch'));

    render(<InventoryList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  test('renders empty state when no items', async () => {
    mockInventoryApi.getAll.mockResolvedValue([]);

    render(<InventoryList />);

    await waitFor(() => {
      expect(screen.getByText('Your inventory is empty')).toBeInTheDocument();
    });
  });

  test('updates item quantity when + button is clicked', async () => {
    const mockItems = [
      {
        id: 1,
        name: 'Milk',
        quantity: 2,
        category: 'Groceries' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }
    ];

    mockInventoryApi.getAll.mockResolvedValue(mockItems);
    mockInventoryApi.update.mockResolvedValue();

    render(<InventoryList />);

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    const increaseButton = screen.getByText('+');
    fireEvent.click(increaseButton);

    await waitFor(() => {
      expect(mockInventoryApi.update).toHaveBeenCalledWith(1, {
        name: 'Milk',
        quantity: 3,
        category: 'Groceries',
        expirationDate: undefined
      });
    });
  });

  // T019 — Delete + undo tests
  test('delete button is present on each item row', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItem]);
    render(<InventoryList />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /remove milk/i })).toBeInTheDocument();
  });

  test('clicking delete removes item from DOM immediately (optimistic)', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItem]);
    mockInventoryApi.delete.mockResolvedValue();
    render(<InventoryList />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /remove milk/i }));

    expect(screen.queryByText('Milk')).not.toBeInTheDocument();
  });

  test('undo toast appears after delete', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItem]);
    mockInventoryApi.delete.mockResolvedValue();
    render(<InventoryList />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /remove milk/i }));

    await waitFor(() => expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument());
  });

  test('clicking undo restores the item', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItem]);
    mockInventoryApi.delete.mockResolvedValue();
    mockInventoryApi.restoreItem.mockResolvedValue(mockItem);
    render(<InventoryList />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /remove milk/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /undo/i }));

    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
  });

  test('item reappears with error message when DELETE API fails', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItem]);
    mockInventoryApi.delete.mockRejectedValue(new Error('Network error'));
    render(<InventoryList />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /remove milk/i }));

    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    expect(screen.getByText(/failed to remove/i)).toBeInTheDocument();
  });

  test('+/- quantity controls still render after delete button is added', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItem]);
    render(<InventoryList />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /increase quantity/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeInTheDocument();
  });

  // T023 — Inline quantity editing tests
  test('clicking quantity value shows editable input pre-filled with current value', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItem]);
    render(<InventoryList />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /edit quantity/i }));

    const input = screen.getByRole('spinbutton', { name: /inline quantity/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(2);
  });

  test('confirming valid quantity with Enter calls update and shows new value', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItem]);
    mockInventoryApi.update.mockResolvedValue(undefined);
    render(<InventoryList />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /edit quantity/i }));
    const input = screen.getByRole('spinbutton', { name: /inline quantity/i });
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockInventoryApi.update).toHaveBeenCalledWith(1, expect.objectContaining({ quantity: 10 }));
    });
  });

  test('confirming invalid quantity shows error and does not call API', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItem]);
    render(<InventoryList />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /edit quantity/i }));
    const input = screen.getByRole('spinbutton', { name: /inline quantity/i });
    fireEvent.change(input, { target: { value: '-5' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(await screen.findByText(/invalid quantity/i)).toBeInTheDocument();
    expect(mockInventoryApi.update).not.toHaveBeenCalled();
  });

  test('pressing Escape cancels edit without saving', async () => {
    mockInventoryApi.getAll.mockResolvedValue([mockItem]);
    render(<InventoryList />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /edit quantity/i }));
    const input = screen.getByRole('spinbutton', { name: /inline quantity/i });
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(mockInventoryApi.update).not.toHaveBeenCalled();
    expect(screen.queryByRole('spinbutton', { name: /inline quantity/i })).not.toBeInTheDocument();
  });
});
