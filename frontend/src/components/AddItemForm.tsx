import React, { useState } from 'react';
import { inventoryApi } from '../services/inventoryApi';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddItemFormProps {
  onItemAdded: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onItemAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    category: '',
    expirationDate: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    const quantity = parseInt(formData.quantity, 10);
    if (formData.quantity === '' || isNaN(quantity) || quantity < 0)
      newErrors.quantity = 'Quantity cannot be negative';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.create({
        name: formData.name.trim(),
        quantity: parseInt(formData.quantity, 10),
        category: formData.category as 'Groceries' | 'Medications' | 'Consumables',
        expirationDate: formData.expirationDate || undefined,
      });
      onItemAdded();
      setFormData({ name: '', quantity: '', category: '', expirationDate: '' });
      setErrors({});
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md" aria-labelledby="add-item-title">
      <h2 id="add-item-title" className="text-xl font-semibold">Add New Inventory Item</h2>

      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          aria-label="Item name"
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <span id="name-error" className="text-destructive text-sm" role="alert">{errors.name}</span>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="0"
          aria-label="Item quantity"
          aria-describedby={errors.quantity ? 'quantity-error' : undefined}
          aria-invalid={!!errors.quantity}
        />
        {errors.quantity && (
          <span id="quantity-error" className="text-destructive text-sm" role="alert">{errors.quantity}</span>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="category-trigger">Category</Label>
        <Select
          value={formData.category}
          onValueChange={value => {
            setFormData(prev => ({ ...prev, category: value }));
            if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
          }}
        >
          <SelectTrigger
            id="category-trigger"
            aria-label="Item category"
            aria-invalid={!!errors.category}
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Groceries">Groceries</SelectItem>
            <SelectItem value="Medications">Medications</SelectItem>
            <SelectItem value="Consumables">Consumables</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <span id="category-error" className="text-destructive text-sm" role="alert">{errors.category}</span>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="expirationDate">Expiration Date (optional)</Label>
        <Input
          type="date"
          id="expirationDate"
          name="expirationDate"
          value={formData.expirationDate}
          onChange={handleChange}
          aria-label="Item expiration date"
        />
      </div>

      {submitError && (
        <div className="text-destructive text-sm" role="alert" aria-live="assertive">{submitError}</div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding Item...' : 'Add Item'}
      </Button>
    </form>
  );
};

export default AddItemForm;
