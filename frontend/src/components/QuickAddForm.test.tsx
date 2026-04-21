import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import QuickAddForm from './QuickAddForm';
import { inventoryApi, InventoryItem } from '../services/inventoryApi';

jest.mock('../services/inventoryApi');
const mockApi = inventoryApi as jest.Mocked<typeof inventoryApi>;

const existingItems: InventoryItem[] = [
  { id: 1, name: 'Milk', quantity: 2, category: 'Groceries', createdAt: '', updatedAt: '' },
  { id: 2, name: 'Bread', quantity: 1, category: 'Groceries', createdAt: '', updatedAt: '' },
];

function setup(items = existingItems, onSuccess = jest.fn()) {
  render(<QuickAddForm items={items} onSuccess={onSuccess} />);
  return { onSuccess };
}

describe('QuickAddForm', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders name input (combobox) and quantity field', () => {
    setup();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
  });

  test('does not show category or expiry fields by default', () => {
    setup();
    expect(screen.queryByLabelText(/category/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/expir/i)).not.toBeInTheDocument();
  });

  test('"More options" expander reveals category and expiry fields', async () => {
    setup();
    fireEvent.click(screen.getByText(/more options/i));
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expir/i)).toBeInTheDocument();
  });

  test('shows inline error when name is empty on submit', async () => {
    setup();
    fireEvent.submit(screen.getByRole('form'));
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(mockApi.create).not.toHaveBeenCalled();
    expect(mockApi.update).not.toHaveBeenCalled();
  });

  test('shows inline error for negative quantity', async () => {
    setup();
    const qtyInput = screen.getByLabelText(/quantity/i);
    fireEvent.change(qtyInput, { target: { value: '-1' } });
    fireEvent.submit(screen.getByRole('form'));
    expect(await screen.findByText(/quantity must be/i)).toBeInTheDocument();
    expect(mockApi.create).not.toHaveBeenCalled();
  });

  test('calls create API for a new item name', async () => {
    mockApi.create.mockResolvedValue({ id: 3, name: 'Eggs', quantity: 6, category: 'Groceries', createdAt: '', updatedAt: '' });
    setup();

    const nameInput = screen.getByRole('combobox');
    fireEvent.change(nameInput, { target: { value: 'Eggs' } });
    const qtyInput = screen.getByLabelText(/quantity/i);
    fireEvent.change(qtyInput, { target: { value: '6' } });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockApi.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Eggs', quantity: 6 }));
    });
    expect(mockApi.update).not.toHaveBeenCalled();
  });

  test('calls update API (increments quantity) for existing item name (case-insensitive match)', async () => {
    mockApi.update.mockResolvedValue(undefined);
    setup();

    const nameInput = screen.getByRole('combobox');
    fireEvent.change(nameInput, { target: { value: 'milk' } });
    const qtyInput = screen.getByLabelText(/quantity/i);
    fireEvent.change(qtyInput, { target: { value: '3' } });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockApi.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ quantity: 5 }) // 2 existing + 3 added
      );
    });
    expect(mockApi.create).not.toHaveBeenCalled();
  });

  test('resets form and focuses name input after successful create', async () => {
    mockApi.create.mockResolvedValue({ id: 3, name: 'Eggs', quantity: 6, category: 'Groceries', createdAt: '', updatedAt: '' });
    const { onSuccess } = setup();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Eggs' } });
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '6' } });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(document.activeElement).toBe(screen.getByRole('combobox'));
  });
});
