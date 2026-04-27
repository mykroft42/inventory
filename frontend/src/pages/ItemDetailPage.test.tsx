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

// Mock shadcn/ui Select as a native <select> for JSDOM compatibility
vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <select value={value ?? ''} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  SelectGroup: ({ children }: any) => <>{children}</>,
  SelectLabel: ({ children }: any) => <>{children}</>,
  SelectSeparator: () => null,
}));

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
    await waitFor(() => {
      const dateInput = screen.getByLabelText(/expiration date/i);
      expect(dateInput).toHaveValue('2025-12-31');
    });
  });

  test('renders — for missing category', async () => {
    mockInventoryApi.getById.mockResolvedValue({ ...mockItem, category: null });
    renderWithRoute();
    await waitFor(() => expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1));
  });

  test('renders empty date input for missing expiration date', async () => {
    mockInventoryApi.getById.mockResolvedValue({ ...mockItem, expirationDate: null });
    renderWithRoute();
    await waitFor(() => {
      const dateInput = screen.getByLabelText(/expiration date/i);
      expect(dateInput).toHaveValue('');
    });
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

describe('US1: Category Edit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('(a) renders category Select showing current value with all options', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('Medications');
    expect(screen.getByRole('option', { name: 'Groceries' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Medications' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Consumables' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '—' })).toBeInTheDocument();
  });

  test('(b) selecting new category and clicking Save calls inventoryApi.update() with new category', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    mockInventoryApi.update.mockResolvedValue(undefined);
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Groceries' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(mockInventoryApi.update).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ category: 'Groceries' })
      );
    });
  });

  test('(c) successful save keeps user on detail page without navigating away', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    mockInventoryApi.update.mockResolvedValue(undefined);
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Groceries' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => expect(mockInventoryApi.update).toHaveBeenCalled());
    expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
    expect(screen.queryByText('Inventory Page')).not.toBeInTheDocument();
  });

  test('(d) save failure shows error message and reverts Select to previous category', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    mockInventoryApi.update.mockRejectedValue(new Error('Server error'));
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Groceries' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to save/i);
    expect(screen.getByRole('combobox')).toHaveValue('Medications');
  });

  test('(e) selecting unset option and saving sends null as category', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    mockInventoryApi.update.mockResolvedValue(undefined);
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'none' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(mockInventoryApi.update).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ category: null })
      );
    });
  });

  test('(f) no editable input for item name or quantity is rendered', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));

    expect(screen.getByRole('heading', { name: 'Ibuprofen' })).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  test('(g) clicking Save with no draft changes still calls inventoryApi.update() and shows no error', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    mockInventoryApi.update.mockResolvedValue(undefined);
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() =>
      expect(mockInventoryApi.update).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ category: 'Medications' })
      )
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('US2: Expiration Date Edit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('(a) date input renders showing current expirationDate as YYYY-MM-DD', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));

    const dateInput = screen.getByLabelText(/expiration date/i);
    expect(dateInput).toHaveValue('2025-12-31');
  });

  test('(a2) date input shows empty string when expirationDate is null', async () => {
    mockInventoryApi.getById.mockResolvedValue({ ...mockItem, expirationDate: null });
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));

    const dateInput = screen.getByLabelText(/expiration date/i);
    expect(dateInput).toHaveValue('');
  });

  test('(b) picking new date and clicking Save calls inventoryApi.update() with ISO datetime string', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    mockInventoryApi.update.mockResolvedValue(undefined);
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));

    const dateInput = screen.getByLabelText(/expiration date/i);
    fireEvent.change(dateInput, { target: { value: '2027-01-15' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(mockInventoryApi.update).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ expirationDate: '2027-01-15T00:00:00' })
      );
    });
  });

  test('(c) clearing the date and clicking Save sends null as expirationDate', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    mockInventoryApi.update.mockResolvedValue(undefined);
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));

    const dateInput = screen.getByLabelText(/expiration date/i);
    fireEvent.change(dateInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(mockInventoryApi.update).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ expirationDate: null })
      );
    });
  });

  test('(d) saving a past date succeeds without frontend rejection', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    mockInventoryApi.update.mockResolvedValue(undefined);
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));

    const dateInput = screen.getByLabelText(/expiration date/i);
    fireEvent.change(dateInput, { target: { value: '2020-01-01' } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() =>
      expect(mockInventoryApi.update).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ expirationDate: '2020-01-01T00:00:00' })
      )
    );
  });

  test('(e) save failure shows error message and reverts date input to previous value', async () => {
    mockInventoryApi.getById.mockResolvedValue(mockItem);
    mockInventoryApi.update.mockRejectedValue(new Error('Server error'));
    renderWithRoute();
    await waitFor(() => screen.getByText('Ibuprofen'));

    const dateInput = screen.getByLabelText(/expiration date/i);
    fireEvent.change(dateInput, { target: { value: '2027-06-15' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to save/i);
    expect(dateInput).toHaveValue('2025-12-31');
  });
});
