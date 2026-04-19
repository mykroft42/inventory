import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddItemForm from './AddItemForm';
import { inventoryApi } from '../services/inventoryApi';

// Mock the API
jest.mock('../services/inventoryApi');
const mockInventoryApi = inventoryApi as jest.Mocked<typeof inventoryApi>;

describe('AddItemForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form with all fields', () => {
    render(<AddItemForm onItemAdded={() => {}} />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Expiration Date (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const mockOnItemAdded = jest.fn();
    const mockItem = {
      id: 1,
      name: 'Test Item',
      quantity: 5,
      category: 'Groceries' as const,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    mockInventoryApi.create.mockResolvedValue(mockItem);

    render(<AddItemForm onItemAdded={mockOnItemAdded} />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Item' } });
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Groceries' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));

    await waitFor(() => {
      expect(mockInventoryApi.create).toHaveBeenCalledWith({
        name: 'Test Item',
        quantity: 5,
        category: 'Groceries'
      });
    });

    expect(mockOnItemAdded).toHaveBeenCalled();
  });

  test('shows error message when submission fails', async () => {
    mockInventoryApi.create.mockRejectedValue(new Error('Failed to add item'));

    render(<AddItemForm onItemAdded={() => {}} />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Item' } });
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Groceries' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to add item')).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    render(<AddItemForm onItemAdded={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Quantity must be greater than 0')).toBeInTheDocument();
    expect(screen.getByText('Category is required')).toBeInTheDocument();
  });
});