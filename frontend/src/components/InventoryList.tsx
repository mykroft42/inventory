import React, { useState, useEffect } from 'react';
import { inventoryApi, InventoryItem } from '../services/inventoryApi';

const InventoryList: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchItems();
  }, []);

  const handleQuantityChange = async (id: number, newQuantity: number) => {
    if (newQuantity < 0) return;

    try {
      const item = items.find(i => i.id === id);
      if (item) {
        await inventoryApi.update(id, {
          name: item.name,
          quantity: newQuantity,
          category: item.category,
          expirationDate: item.expirationDate
        });
        // Refresh the list
        await fetchItems();
      }
    } catch (err) {
      setError('Error updating quantity');
    }
  };

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
          <li key={item.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd' }}>
            <h3>{item.name}</h3>
            <p>Category: {item.category}</p>
            {item.expirationDate && <p>Expires: {new Date(item.expirationDate).toLocaleDateString()}</p>}
            <div>
              <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
              <span style={{ margin: '0 10px' }}>Quantity: {item.quantity}</span>
              <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryList;