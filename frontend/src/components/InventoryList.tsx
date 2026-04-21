import React, { useState, useEffect, useRef } from 'react';
import { inventoryApi, InventoryItem } from '../services/inventoryApi';
import UndoToast from './UndoToast';

interface DeletedState {
  item: InventoryItem;
  toastVisible: boolean;
  error: string | null;
}

const InventoryList: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<DeletedState | null>(null);
  const [editingQty, setEditingQty] = useState<{ id: number; value: string; error: string } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchItems = async () => {
    try {
      setError(null);
      const data = await inventoryApi.getAll();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory. Please check your connection and try again.');
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
          category: item.category ?? undefined,
          expirationDate: item.expirationDate ?? undefined,
        });
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQuantity } : i));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItems(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const handleDelete = async (item: InventoryItem, index: number) => {
    // Optimistic remove
    setItems(prev => prev.filter(i => i.id !== item.id));
    // Move focus to next item or list container
    setTimeout(() => {
      const rows = listRef.current?.querySelectorAll('[role="listitem"]');
      if (rows && rows.length > 0) {
        const next = rows[Math.min(index, rows.length - 1)] as HTMLElement;
        next?.focus();
      } else {
        listRef.current?.focus();
      }
    }, 0);

    try {
      await inventoryApi.delete(item.id);
      setDeleted({ item, toastVisible: true, error: null });
    } catch {
      // Restore item with error
      setItems(prev => {
        const next = [...prev];
        next.splice(index, 0, { ...item, });
        return next;
      });
      setDeleted({ item, toastVisible: false, error: 'Failed to remove — please try again' });
    }
  };

  const handleUndo = async () => {
    if (!deleted) return;
    setDeleted(prev => prev ? { ...prev, toastVisible: false } : null);
    try {
      const restored = await inventoryApi.restoreItem(deleted.item.id);
      setItems(prev => [...prev, restored]);
    } catch {
      setError('Failed to restore item. Please try again.');
    }
  };

  const handleToastDismiss = () => {
    setDeleted(prev => prev ? { ...prev, toastVisible: false } : null);
  };

  const startEditQty = (item: InventoryItem) => {
    setEditingQty({ id: item.id, value: String(item.quantity), error: '' });
  };

  const commitEditQty = async (item: InventoryItem) => {
    if (!editingQty || editingQty.id !== item.id) return;
    const qty = parseInt(editingQty.value, 10);
    if (isNaN(qty) || qty < 0) {
      setEditingQty(prev => prev ? { ...prev, error: 'Invalid quantity' } : null);
      return;
    }
    setEditingQty(null);
    await handleQuantityChange(item.id, qty);
  };

  const cancelEditQty = () => setEditingQty(null);

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

  if (items.length === 0 && !deleted) {
    return (
      <div className="empty-state">
        <h2>Your inventory is empty</h2>
        <p>Start by adding your first item to keep track of your household supplies.</p>
      </div>
    );
  }

  return (
    <>
      <div className="inventory-list">
        <h2>Inventory Items ({items.length})</h2>
        <div ref={listRef} className="inventory-grid" role="list" aria-label="Inventory items" tabIndex={-1}>
          {items.map((item, index) => (
            <div key={item.id} className="inventory-item" role="listitem">
              <h3>{item.name}</h3>
              {item.category && <p className="category">Category: {item.category}</p>}
              {item.expirationDate && (
                <p className="expiration">
                  Expires: {new Date(item.expirationDate).toLocaleDateString()}
                  {new Date(item.expirationDate) < new Date() && (
                    <span className="expired" aria-label="This item has expired"> (Expired)</span>
                  )}
                </p>
              )}
              {deleted?.item.id === item.id && deleted.error && (
                <p className="item-error" role="alert">{deleted.error}</p>
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
                {editingQty?.id === item.id ? (
                  <span>
                    <input
                      type="number"
                      aria-label="Inline quantity"
                      value={editingQty.value}
                      min="0"
                      autoFocus
                      onChange={e => setEditingQty(prev => prev ? { ...prev, value: e.target.value, error: '' } : null)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitEditQty(item);
                        if (e.key === 'Escape') cancelEditQty();
                      }}
                      onBlur={() => commitEditQty(item)}
                    />
                    {editingQty.error && <span>{editingQty.error}</span>}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="quantity"
                    aria-label={`Edit quantity of ${item.name}, currently ${updatingItems.has(item.id) ? 'updating' : item.quantity}`}
                    onClick={() => startEditQty(item)}
                  >
                    {updatingItems.has(item.id) ? '...' : item.quantity}
                  </button>
                )}
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
              <button
                onClick={() => handleDelete(item, index)}
                className="btn btn-small btn-danger"
                aria-label={`Remove ${item.name}`}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      <UndoToast
        message={`"${deleted?.item.name}" removed`}
        onUndo={handleUndo}
        onDismiss={handleToastDismiss}
        visible={deleted?.toastVisible ?? false}
      />
    </>
  );
};

export default InventoryList;
