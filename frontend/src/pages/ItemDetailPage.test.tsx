import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ItemDetailPage from './ItemDetailPage';
import { inventoryApi } from '../services/inventoryApi';

vi.mock('../services/inventoryApi');
const mockInventoryApi = inventoryApi as ReturnType<typeof vi.mocked<typeof inventoryApi>>;

const mockItem = {
  id: 42,
  name: 'Ibuprofen',
  quantity: 3,
  category: 'Medications' as const,
  expirationDate: '2025-12-31T00:00:00',
  createdAt: '2026-01-15T10:23:45Z',
  updatedAt: '2026-03-01T08:00:00Z',
  deletedAt: null,
};

function renderWithRoute(id: number | string = 42) {
  return render(
    <MemoryRouter initialEntries={[`/inventory/${id}`]}>
      <Routes>
        <Route path="/inventory/:id" element={<ItemDetailPage />} />
        <Route path="/inventory" element={<div>Inventory Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ItemDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading state initially', () => {
    let resolve: (v: typeof mockItem) => void;
    mockInventoryApi.getById.mockReturnValue(new Promise(r => { resolve = r; }) as any);
    renderWithRoute();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    resolve!(mockItem);
  });

  test('renders item name after loading', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    renderWithRoute();
    await waitFor(() => expect(screen.getByText('Ibuprofen')).toBeInTheDocument());
  });

  test('renders quantity after loading', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    renderWithRoute();
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
  });

  test('renders category after loading', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    renderWithRoute();
    await waitFor(() => expect(screen.getByText('Medications')).toBeInTheDocument());
  });

  test('renders expiration date when present', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    renderWithRoute();
    await waitFor(() => expect(screen.getByText(/2025/)).toBeInTheDocument());
  });

  test('renders — for missing category', async () => {
    mockInventoryApi.getById.mockResolvedValue({ ...mockItem, category: null });
    renderWithRoute();
    await waitFor(() => expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1));
  });

  test('renders — for missing expiration date', async () => {
    mockInventoryApi.getById.mockResolvedValue({ ...mockItem, expirationDate: null });
    renderWithRoute();
    await waitFor(() => expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1));
  });

  test('renders Remove button', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    renderWithRoute();
    await waitFor(() => expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument());
  });

  test('Remove button opens confirmation dialog', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    renderWithRoute();
    await waitFor(() => screen.getByRole('button', { name: /remove/i }));
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    await waitFor(() => expect(screen.getByRole('alertdialog')).toBeInTheDocument());
  });

  test('cancelling dialog leaves user on detail page unchanged', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    renderWithRoute();
    await waitFor(() => screen.getByRole('button', { name: /remove/i }));
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    await waitFor(() => screen.getByRole('alertdialog'));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
  });

  test('confirming deletes item and navigates to /inventory', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    mockInventoryApi.delete.mockResolvedValue(undefined);
    renderWithRoute();
    await waitFor(() => screen.getByRole('button', { name: /remove/i }));
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    await waitFor(() => screen.getByRole('alertdialog'));
    const dialog = screen.getByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /confirm/i }));
    await waitFor(() => expect(screen.getByText('Inventory Page')).toBeInTheDocument());
    expect(mockInventoryApi.delete).toHaveBeenCalledWith(42);
  });

  test('back link navigates to /inventory', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));
    fireEvent.click(screen.getByRole('link', { name: /back|inventory/i }));
    await waitFor(() => expect(screen.getByText('Inventory Page')).toBeInTheDocument());
  });

  test('renders not-found message with back link on 404', async () => {
    const notFoundError = Object.assign(new Error('Item not found'), { status: 404 });
    mockInventoryApi.getById.mockRejectedValue(notFoundError);
    renderWithRoute(999);
    await waitFor(() => expect(screen.getByText(/not found/i)).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /back|inventory/i })).toBeInTheDocument();
  });
});
