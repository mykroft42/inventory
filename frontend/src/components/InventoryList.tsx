import React, { useState, useEffect } from 'react';
import { inventoryApi, InventoryItem } from '../services/inventoryApi';

const InventoryList: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setError(null);
      const data = await inventoryApi.getAll();
      setItems(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load inventory. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleQuantityChange = async (id: number, newQuantity: number) => {
    if (newQuantity < 0) return;

    setUpdatingItems(prev => new Set(prev).add(id));

    try {
      const item = items.find(i => i.id === id);
      if (item) {
        await inventoryApi.update(id, {
          name: item.name,
          quantity: newQuantity,
          category: item.category,
          expirationDate: item.expirationDate
        });
        // Update local state optimistically
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update quantity. Please try again.');
      }
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchItems} className="btn btn-secondary">Retry</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h2>Your inventory is empty</h2>
        <p>Start by adding your first item to keep track of your household supplies.</p>
      </div>
    );
  }

  return (
    <div className="inventory-list">
      <h2>Inventory Items ({items.length})</h2>
      <div className="inventory-grid" role="list" aria-label="Inventory items">
        {items.map((item) => (
          <div key={item.id} className="inventory-item" role="listitem">
            <h3>{item.name}</h3>
            <p className="category">Category: {item.category}</p>
            {item.expirationDate && (
              <p className="expiration">
                Expires: {new Date(item.expirationDate).toLocaleDateString()}
                {new Date(item.expirationDate) < new Date() && (
                  <span className="expired" aria-label="This item has expired"> (Expired)</span>
                )}
              </p>
            )}
            <div className="quantity-controls" role="group" aria-label={`Quantity controls for ${item.name}`}>
              <button
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                disabled={updatingItems.has(item.id)}
                className="btn btn-small"
                aria-label={`Decrease quantity of ${item.name} by 1`}
                type="button"
              >
                -
              </button>
              <span className="quantity-label">Quantity:</span>
              <span
                className="quantity"
                aria-label={`Current quantity: ${updatingItems.has(item.id) ? 'updating' : item.quantity}`}
                role="status"
                aria-live="polite"
              >
                {updatingItems.has(item.id) ? '...' : item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                disabled={updatingItems.has(item.id)}
                className="btn btn-small"
                aria-label={`Increase quantity of ${item.name} by 1`}
                type="button"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryList;