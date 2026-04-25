import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryApi, InventoryItem } from '../services/inventoryApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TriangleAlert } from 'lucide-react';
import QuantityCell from './QuantityCell';

function isExpiredItem(item: InventoryItem): boolean {
  return item.expirationDate != null && new Date(item.expirationDate) <= new Date();
}

function sortInventoryItems(items: InventoryItem[]): InventoryItem[] {
  const tierKey = (item: InventoryItem): number => {
    if (item.quantity === 0) return 2;
    if (isExpiredItem(item)) return 0;
    return 1;
  };
  return [...items].sort((a, b) => {
    const tierDiff = tierKey(a) - tierKey(b);
    if (tierDiff !== 0) return tierDiff;
    return a.name.localeCompare(b.name);
  });
}

const InventoryTable: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [editingQty, setEditingQty] = useState<{ id: number; value: string; error: string } | null>(null);

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
      <div className="flex flex-col items-center py-12 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading your inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <p className="text-destructive">{error}</p>
        <Button variant="secondary" onClick={fetchItems}>Retry</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-2 text-center">
        <h2 className="text-lg font-semibold">Your inventory is empty</h2>
        <p className="text-muted-foreground">Start by adding your first item to keep track of your household supplies.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden sm:table-cell">Category</TableHead>
          <TableHead>Qty</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortInventoryItems(items).map(item => {
          const isExpired = isExpiredItem(item);
          return (
            <TableRow
              key={item.id}
              data-testid={`inventory-row-${item.id}`}
              className={item.quantity === 0 ? 'text-muted-foreground' : ''}
            >
              <TableCell className="max-w-[30ch] font-medium">
                <span className="flex items-center gap-1">
                  <Link
                    to={`/inventory/${item.id}`}
                    className="truncate hover:underline"
                  >
                    {item.name}
                  </Link>
                  {isExpired && (
                    <TriangleAlert
                      aria-label="Expired warning"
                      className="shrink-0 text-destructive w-4 h-4"
                    />
                  )}
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{item.category ?? '—'}</TableCell>
              <TableCell>
                <QuantityCell
                  item={item}
                  isUpdating={updatingItems.has(item.id)}
                  editingQty={editingQty}
                  onDecrement={() => handleQuantityChange(item.id, item.quantity - 1)}
                  onIncrement={() => handleQuantityChange(item.id, item.quantity + 1)}
                  onStartEdit={() => startEditQty(item)}
                  onCommitEdit={() => commitEditQty(item)}
                  onCancelEdit={cancelEditQty}
                  onEditChange={value => setEditingQty(prev => prev ? { ...prev, value, error: '' } : null)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default InventoryTable;
