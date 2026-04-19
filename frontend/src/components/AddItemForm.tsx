import React, { useState } from 'react';
import { inventoryApi } from '../services/inventoryApi';

interface AddItemFormProps {
  onItemAdded: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onItemAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    category: '',
    expirationDate: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const quantity = parseInt(formData.quantity, 10);
    if (formData.quantity === '' || isNaN(quantity) || quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const itemData = {
        name: formData.name.trim(),
        quantity: parseInt(formData.quantity, 10),
        category: formData.category as 'Groceries' | 'Medications' | 'Consumables',
        expirationDate: formData.expirationDate || undefined,
      };

      await inventoryApi.create(itemData);
      onItemAdded();

      // Reset form
      setFormData({
        name: '',
        quantity: '',
        category: '',
        expirationDate: ''
      });
      setErrors({});
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Failed to add item. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (submitError) {
      setSubmitError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-item-form" aria-labelledby="add-item-title">
      <h2 id="add-item-title">Add New Inventory Item</h2>

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'error' : ''}
          aria-describedby={errors.name ? "name-error" : undefined}
          aria-invalid={!!errors.name}
          required
          aria-label="Item name"
        />
        {errors.name && <span id="name-error" className="error-message" role="alert">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="quantity">Quantity</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="0"
          className={errors.quantity ? 'error' : ''}
          aria-describedby={errors.quantity ? "quantity-error" : undefined}
          aria-invalid={!!errors.quantity}
          required
          aria-label="Item quantity"
        />
        {errors.quantity && <span id="quantity-error" className="error-message" role="alert">{errors.quantity}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={errors.category ? 'error' : ''}
          aria-describedby={errors.category ? "category-error" : undefined}
          aria-invalid={!!errors.category}
          required
          aria-label="Item category"
        >
          <option value="">Select category</option>
          <option value="Groceries">Groceries</option>
          <option value="Medications">Medications</option>
          <option value="Consumables">Consumables</option>
        </select>
        {errors.category && <span id="category-error" className="error-message" role="alert">{errors.category}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="expirationDate">Expiration Date (optional)</label>
        <input
          type="date"
          id="expirationDate"
          name="expirationDate"
          value={formData.expirationDate}
          onChange={handleChange}
          aria-label="Item expiration date"
        />
      </div>

      {submitError && <div className="error-message" role="alert" aria-live="assertive">{submitError}</div>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn"
        aria-describedby={isSubmitting ? "submitting-status" : undefined}
      >
        {isSubmitting ? 'Adding Item...' : 'Add Item'}
      </button>
      {isSubmitting && <span id="submitting-status" className="sr-only">Submitting form, please wait</span>}
    </form>
  );
};

export default AddItemForm;