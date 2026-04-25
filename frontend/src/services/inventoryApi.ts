export type Category = 'Groceries' | 'Medications' | 'Consumables';

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  category?: Category | null;
  expirationDate?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:5007`;

async function parseError(response: Response, defaultMessage: string): Promise<never> {
  const text = await response.text();
  let message = defaultMessage;

  try {
    const payload = JSON.parse(text) as { error?: string; message?: string; details?: string | string[] };
    if (payload.error) {
      message = payload.error;
    } else if (payload.message) {
      message = payload.message;
    }

    if (payload.details) {
      const detailText = Array.isArray(payload.details) ? payload.details.join('; ') : payload.details;
      message = `${message}${detailText ? `: ${detailText}` : ''}`;
    }
  } catch {
    // Ignore parse errors and use the default message
  }

  throw new Error(message);
}

export const inventoryApi = {
  async getAll(): Promise<InventoryItem[]> {
    const response = await fetch(`${API_BASE_URL}/api/inventory`);
    if (!response.ok) {
      await parseError(response, 'Failed to fetch inventory items.');
    }
    return response.json();
  },

  async getById(id: number): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw Object.assign(new Error('Item not found'), { status: 404 });
      }
      await parseError(response, 'Failed to fetch inventory item.');
    }
    return response.json();
  },

  async create(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/api/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      await parseError(response, 'Failed to create inventory item.');
    }
    return response.json();
  },

  async update(id: number, item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...item, id }),
    });
    if (!response.ok) {
      await parseError(response, 'Failed to update inventory item.');
    }
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      await parseError(response, 'Failed to delete inventory item.');
    }
  },

  async restoreItem(id: number): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/api/inventory/${id}/restore`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      await parseError(response, 'Failed to restore inventory item.');
    }
    return response.json();
  },
};