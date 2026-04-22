import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import QuantityCell from './QuantityCell';

const mockItem = {
  id: 1,
  name: 'Milk',
  quantity: 3,
  category: 'Groceries' as const,
  expirationDate: null,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

const defaultProps = {
  item: mockItem,
  isUpdating: false,
  editingQty: null,
  onDecrement: vi.fn(),
  onIncrement: vi.fn(),
  onStartEdit: vi.fn(),
  onCommitEdit: vi.fn(),
  onCancelEdit: vi.fn(),
  onEditChange: vi.fn(),
};

describe('QuantityCell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('increment button calls onIncrement handler', () => {
    render(<QuantityCell {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(defaultProps.onIncrement).toHaveBeenCalledTimes(1);
  });

  test('decrement button calls onDecrement handler', () => {
    render(<QuantityCell {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /decrease quantity/i }));
    expect(defaultProps.onDecrement).toHaveBeenCalledTimes(1);
  });

  test('decrement button is disabled when quantity is 0', () => {
    const props = { ...defaultProps, item: { ...mockItem, quantity: 0 } };
    render(<QuantityCell {...props} />);
    expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeDisabled();
  });

  test('decrement button is enabled when quantity > 0', () => {
    render(<QuantityCell {...defaultProps} />);
    expect(screen.getByRole('button', { name: /decrease quantity/i })).not.toBeDisabled();
  });

  test('clicking quantity value calls onStartEdit', () => {
    render(<QuantityCell {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /edit quantity/i }));
    expect(defaultProps.onStartEdit).toHaveBeenCalledTimes(1);
  });

  test('shows input when editingQty matches this item', () => {
    const props = {
      ...defaultProps,
      editingQty: { id: mockItem.id, value: '3', error: '' },
    };
    render(<QuantityCell {...props} />);
    expect(screen.getByRole('spinbutton', { name: /inline quantity/i })).toBeInTheDocument();
  });

  test('Enter key calls onCommitEdit', () => {
    const props = {
      ...defaultProps,
      editingQty: { id: mockItem.id, value: '5', error: '' },
    };
    render(<QuantityCell {...props} />);
    const input = screen.getByRole('spinbutton', { name: /inline quantity/i });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onCommitEdit).toHaveBeenCalledTimes(1);
  });

  test('Escape key calls onCancelEdit', () => {
    const props = {
      ...defaultProps,
      editingQty: { id: mockItem.id, value: '5', error: '' },
    };
    render(<QuantityCell {...props} />);
    const input = screen.getByRole('spinbutton', { name: /inline quantity/i });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(defaultProps.onCancelEdit).toHaveBeenCalledTimes(1);
  });

  test('shows error message when editingQty has an error', () => {
    const props = {
      ...defaultProps,
      editingQty: { id: mockItem.id, value: '-1', error: 'Invalid quantity' },
    };
    render(<QuantityCell {...props} />);
    expect(screen.getByText(/invalid quantity/i)).toBeInTheDocument();
  });

  test('input change calls onEditChange', () => {
    const props = {
      ...defaultProps,
      editingQty: { id: mockItem.id, value: '3', error: '' },
    };
    render(<QuantityCell {...props} />);
    const input = screen.getByRole('spinbutton', { name: /inline quantity/i });
    fireEvent.change(input, { target: { value: '7' } });
    expect(defaultProps.onEditChange).toHaveBeenCalledWith('7');
  });
});
