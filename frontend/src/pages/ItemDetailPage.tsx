import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { inventoryApi, InventoryItem, Category } from '../services/inventoryApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type SaveState = 'idle' | 'saving' | 'error';

function toDateString(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  return isoDate.slice(0, 10);
}

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>({ type: 'loading' });
  const [draftCategory, setDraftCategory] = useState<Category | null>(null);
  const [draftExpirationDate, setDraftExpirationDate] = useState<string>('');
  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const item = await inventoryApi.getById(Number(id));
        setState({ type: 'loaded', item });
        setDraftCategory(item.category ?? null);
        setDraftExpirationDate(toDateString(item.expirationDate));
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

  const handleSave = async () => {
    if (state.type !== 'loaded') return;
    const { item } = state;
    setSaveState('saving');
    try {
      const payload = {
        name: item.name,
        quantity: item.quantity,
        category: draftCategory,
        expirationDate: draftExpirationDate === '' ? null : `${draftExpirationDate}T00:00:00`,
        deletedAt: item.deletedAt,
      };
      await inventoryApi.update(item.id, payload);
      setState({
        type: 'loaded',
        item: { ...item, category: draftCategory, expirationDate: payload.expirationDate },
      });
      setSaveState('idle');
    } catch {
      setDraftCategory(item.category ?? null);
      setDraftExpirationDate(toDateString(item.expirationDate));
      setSaveState('error');
    }
  };

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
      <dl className="space-y-4 mb-6">
        <div>
          <dt className="text-sm text-muted-foreground">Quantity</dt>
          <dd className="font-medium">{item.quantity}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground mb-1">Category</dt>
          <dd>
            <Select
              value={draftCategory ?? 'none'}
              onValueChange={(val) =>
                setDraftCategory(val === 'none' ? null : (val as Category))
              }
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="Groceries">Groceries</SelectItem>
                <SelectItem value="Medications">Medications</SelectItem>
                <SelectItem value="Consumables">Consumables</SelectItem>
              </SelectContent>
            </Select>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground mb-1">Expiration Date</dt>
          <dd>
            <Input
              type="date"
              aria-label="Expiration Date"
              value={draftExpirationDate}
              onChange={(e) => setDraftExpirationDate(e.target.value)}
              className="min-h-[44px]"
            />
          </dd>
        </div>
      </dl>
      {saveState === 'error' && (
        <div role="alert" className="text-destructive text-sm mb-3">
          Failed to save changes. Please try again.
        </div>
      )}
      <div className="flex gap-3 mb-8">
        <Button
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className="min-h-[44px]"
        >
          Save
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="min-h-[44px]">Remove</Button>
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
    </div>
  );
};

export default ItemDetailPage;
