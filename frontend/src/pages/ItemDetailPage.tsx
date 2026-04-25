import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { inventoryApi, InventoryItem } from '../services/inventoryApi';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

type PageState =
  | { type: 'loading' }
  | { type: 'loaded'; item: InventoryItem }
  | { type: 'not-found' }
  | { type: 'error'; message: string };

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>({ type: 'loading' });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const item = await inventoryApi.getById(Number(id));
        setState({ type: 'loaded', item });
      } catch (err) {
        if ((err as any).status === 404) {
          setState({ type: 'not-found' });
        } else {
          setState({ type: 'error', message: (err as Error).message || 'Failed to load item.' });
        }
      }
    };
    fetchItem();
  }, [id]);

  const handleConfirmDelete = async () => {
    if (state.type !== 'loaded') return;
    try {
      await inventoryApi.delete(state.item.id);
      navigate('/inventory');
    } catch {
      // remain on page — user can navigate back manually
    }
  };

  if (state.type === 'loading') {
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (state.type === 'not-found') {
    return (
      <div className="flex flex-col items-center py-12 gap-3 text-center">
        <p className="text-lg font-semibold">Item not found</p>
        <Link to="/inventory" className="text-primary underline">
          ← Back to inventory
        </Link>
      </div>
    );
  }

  if (state.type === 'error') {
    return (
      <div className="flex flex-col items-center py-12 gap-3 text-center">
        <p className="text-destructive">{state.message}</p>
        <Link to="/inventory" className="text-primary underline">
          ← Back to inventory
        </Link>
      </div>
    );
  }

  const { item } = state;

  return (
    <div className="max-w-lg mx-auto py-6">
      <div className="mb-4">
        <Link to="/inventory" className="text-sm text-muted-foreground hover:underline">
          ← Back to inventory
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">{item.name}</h1>
      <dl className="space-y-4 mb-8">
        <div>
          <dt className="text-sm text-muted-foreground">Quantity</dt>
          <dd className="font-medium">{item.quantity}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Category</dt>
          <dd className="font-medium">{item.category ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Expiration Date</dt>
          <dd className="font-medium">
            {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : '—'}
          </dd>
        </div>
      </dl>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Remove</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{item.name}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItemDetailPage;
