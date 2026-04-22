import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import AddItemForm from './AddItemForm';
import { inventoryApi } from '../services/inventoryApi';

vi.mock('../services/inventoryApi');
const mockInventoryApi = vi.mocked(inventoryApi);

describe('AddItemForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders form with all fields', () => {
    render(<AddItemForm onItemAdded={() => {}} />);

    expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/item quantity/i)).toBeInTheDocument();
    // shadcn/ui Select trigger is a combobox role button
    expect(screen.getByRole('combobox', { name: /item category/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/expiration date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const mockOnItemAdded = vi.fn();
    const mockItem = {
      id: 1,
      name: 'Test Item',
      quantity: 5,
      category: 'Groceries' as const,
      expirationDate: null,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    mockInventoryApi.create.mockResolvedValue(mockItem);

    render(<AddItemForm onItemAdded={mockOnItemAdded} />);

    fireEvent.change(screen.getByLabelText(/item name/i), { target: { value: 'Test Item' } });
    fireEvent.change(screen.getByLabelText(/item quantity/i), { target: { value: '5' } });

    // Select category via shadcn/ui Select trigger → open → click option
    fireEvent.click(screen.getByRole('combobox', { name: /item category/i }));
    fireEvent.click(screen.getByRole('option', { name: 'Groceries' }));

    fireEvent.click(screen.getByRole('button', { name: /add item/i }));

    await waitFor(() => {
      expect(mockInventoryApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Item', quantity: 5, category: 'Groceries' })
      );
    });

    expect(mockOnItemAdded).toHaveBeenCalled();
  });

  test('shows error message when submission fails', async () => {
    mockInventoryApi.create.mockRejectedValue(new Error('Failed to add item'));

    render(<AddItemForm onItemAdded={() => {}} />);

    fireEvent.change(screen.getByLabelText(/item name/i), { target: { value: 'Test Item' } });
    fireEvent.change(screen.getByLabelText(/item quantity/i), { target: { value: '5' } });

    fireEvent.click(screen.getByRole('combobox', { name: /item category/i }));
    fireEvent.click(screen.getByRole('option', { name: 'Groceries' }));

    fireEvent.click(screen.getByRole('button', { name: /add item/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to add item')).toBeInTheDocument();
    });
  });

  test('validates required fields', () => {
    render(<AddItemForm onItemAdded={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /add item/i }));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Quantity cannot be negative')).toBeInTheDocument();
    expect(screen.getByText('Category is required')).toBeInTheDocument();
  });
});
