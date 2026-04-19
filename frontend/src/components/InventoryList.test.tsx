import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InventoryList from './InventoryList';
import { inventoryApi } from '../services/inventoryApi';

// Mock the API
jest.mock('../services/inventoryApi');
const mockInventoryApi = inventoryApi as jest.Mocked<typeof inventoryApi>;

describe('InventoryList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(screen.getByLabelText('Current quantity: 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Current quantity: 1')).toBeInTheDocument();
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
});
