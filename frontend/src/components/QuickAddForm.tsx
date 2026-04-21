import React, { useRef, useState } from 'react';
import { inventoryApi, InventoryItem, Category } from '../services/inventoryApi';
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
    <form onSubmit={handleSubmit} aria-label="Quick add item" role="form" noValidate className="quick-add-form">
      <div>
        <label htmlFor="quick-add-name">Name</label>
        <ComboBox
          ref={nameInputRef}
          id="quick-add-name"
          value={name}
          suggestions={suggestions}
          onChange={setName}
          onSelect={val => { setName(val); }}
          placeholder="Item name"
        />
        {nameError && <span role="alert">{nameError}</span>}
      </div>

      <div>
        <label htmlFor="quick-add-qty">Quantity</label>
        <input
          id="quick-add-qty"
          type="number"
          min="0"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          placeholder="1"
        />
        {quantityError && <span role="alert">{quantityError}</span>}
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add'}
      </button>

      <div>
        <button type="button" onClick={() => setShowMore(m => !m)} aria-expanded={showMore}>
          More options
        </button>
        {showMore && (
          <>
            <div>
              <label htmlFor="quick-add-category">Category</label>
              <select
                id="quick-add-category"
                role="listbox"
                value={category}
                onChange={e => setCategory(e.target.value as Category | '')}
              >
                <option value="">None</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="quick-add-expiry">Expiration date</label>
              <input
                id="quick-add-expiry"
                type="date"
                value={expirationDate}
                onChange={e => setExpirationDate(e.target.value)}
              />
            </div>
          </>
        )}
      </div>
    </form>
  );
};

export default QuickAddForm;
