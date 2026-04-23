import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
import { Badge } from '@/components/ui/badge';
import QuantityCell from './QuantityCell';

interface DeletedState {
  item: InventoryItem;
  error: string | null;
}

const InventoryTable: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [deleted, setDeleted] = useState<DeletedState | null>(null);
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

  const handleDelete = async (item: InventoryItem) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    try {
      await inventoryApi.delete(item.id);
      setDeleted({ item, error: null });
      toast(`"${item.name}" removed`, {
        action: {
          label: 'Undo',
          onClick: () => handleUndo(item),
        },
      });
    } catch {
      setItems(prev => [...prev, item]);
      setDeleted({ item, error: 'Failed to remove — please try again' });
    }
  };

  const handleUndo = async (item: InventoryItem) => {
    try {
      const restored = await inventoryApi.restoreItem(item.id);
      setItems(prev => [...prev, restored]);
      setDeleted(null);
    } catch {
      setError('Failed to restore item. Please try again.');
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
          <TableHead className="hidden sm:table-cell">Expires</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(item => {
          const isExpired = item.expirationDate != null && new Date(item.expirationDate) <= new Date();
          return (
            <TableRow
              key={item.id}
              data-testid={`inventory-row-${item.id}`}
              className={item.quantity === 0 ? 'text-muted-foreground' : ''}
            >
              <TableCell className="max-w-[30ch] truncate font-medium">{item.name}</TableCell>
              <TableCell className="hidden sm:table-cell">{item.category ?? '—'}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {item.expirationDate
                  ? new Date(item.expirationDate).toLocaleDateString()
                  : '—'}
                {isExpired && (
                  <Badge variant="destructive" className="ml-2">Expired</Badge>
                )}
              </TableCell>
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
                {deleted?.item.id === item.id && deleted.error && (
                  <p className="text-destructive text-xs mt-1" role="alert">{deleted.error}</p>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  type="button"
                  onClick={() => handleDelete(item)}
                  aria-label={`Remove ${item.name}`}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default InventoryTable;
