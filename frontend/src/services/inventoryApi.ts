export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  category: 'Groceries' | 'Medications' | 'Consumables';
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const inventoryApi = {
  async getAll(): Promise<InventoryItem[]> {
    const response = await fetch(`${API_BASE_URL}/api/inventory`);
    if (!response.ok) {
      throw new Error('Failed to fetch inventory items');
    }
    return response.json();
  },

  async getById(id: number): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch inventory item');
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
      throw new Error('Failed to create inventory item');
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
      throw new Error('Failed to update inventory item');
    }
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete inventory item');
    }
  },
};