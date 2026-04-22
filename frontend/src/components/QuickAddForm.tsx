import React, { useRef, useState } from 'react';
import { inventoryApi, InventoryItem, Category } from '../services/inventoryApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import ComboBox from './ComboBox';

interface QuickAddFormProps {
  items: InventoryItem[];
  onSuccess?: () => void;
}

const CATEGORIES: Category[] = ['Groceries', 'Medications', 'Consumables'];

const QuickAddForm: React.FC<QuickAddFormProps> = ({ items, onSuccess }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState<Category | ''>('');
  const [expirationDate, setExpirationDate] = useState('');
  const [nameError, setNameError] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const suggestions = items.map(i => i.name);

  const findExisting = (n: string) =>
    items.find(i => i.name.toLowerCase() === n.toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    setQuantityError('');

    let valid = true;
    if (!name.trim()) {
      setNameError('Name is required');
      valid = false;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setQuantityError('Quantity must be a non-negative number');
      valid = false;
    }
    if (!valid) return;

    setSubmitting(true);
    try {
      const existing = findExisting(name.trim());
      if (existing) {
        await inventoryApi.update(existing.id, {
          name: existing.name,
          quantity: existing.quantity + qty,
          category: category || existing.category || undefined,
          expirationDate: expirationDate || existing.expirationDate || undefined,
        });
      } else {
        await inventoryApi.create({
          name: name.trim(),
          quantity: qty,
          category: category || undefined,
          expirationDate: expirationDate || undefined,
        });
      }
      setName('');
      setQuantity('1');
      setCategory('');
      setExpirationDate('');
      onSuccess?.();
      setTimeout(() => nameInputRef.current?.focus(), 0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Quick add item" role="form" noValidate className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="quick-add-name">Name</Label>
        <ComboBox
          ref={nameInputRef}
          id="quick-add-name"
          value={name}
          suggestions={suggestions}
          onChange={setName}
          onSelect={val => setName(val)}
          placeholder="Item name"
        />
        {nameError && <span role="alert" className="text-destructive text-sm">{nameError}</span>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="quick-add-qty">Quantity</Label>
        <Input
          id="quick-add-qty"
          type="number"
          min="0"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          placeholder="1"
          className="w-24"
        />
        {quantityError && <span role="alert" className="text-destructive text-sm">{quantityError}</span>}
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowMore(m => !m)}
          aria-expanded={showMore}
        >
          More options
        </Button>
      </div>

      {showMore && (
        <div className="space-y-3 pt-1 border-t">
          <div className="space-y-1">
            <Label htmlFor="quick-add-category">Category</Label>
            <select
              id="quick-add-category"
              value={category}
              onChange={e => setCategory(e.target.value as Category | '')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">None</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="quick-add-expiry">Expiration date</Label>
            <Input
              id="quick-add-expiry"
              type="date"
              value={expirationDate}
              onChange={e => setExpirationDate(e.target.value)}
            />
          </div>
        </div>
      )}
    </form>
  );
};

export default QuickAddForm;
