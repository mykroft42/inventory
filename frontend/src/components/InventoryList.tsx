import React, { useState, useEffect } from 'react';
import { inventoryApi, InventoryItem } from '../services/inventoryApi';

const InventoryList: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await inventoryApi.getAll();
        setItems(data);
      } catch (err) {
        setError('Error loading inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return <div>Loading inventory...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (items.length === 0) {
    return <div>No inventory items found</div>;
  }

  return (
    <div>
      <h2>Inventory Items</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <h3>{item.name}</h3>
            <p>Quantity: {item.quantity}</p>
            <p>Category: {item.category}</p>
            {item.expirationDate && <p>Expires: {new Date(item.expirationDate).toLocaleDateString()}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryList;