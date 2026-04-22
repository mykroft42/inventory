import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import QuickAddForm from '../components/QuickAddForm';
import { inventoryApi, InventoryItem } from '../services/inventoryApi';

const AddItemPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    inventoryApi.getAll().then(setItems).catch(() => {});
  }, []);

  const handleSuccess = () => {
    inventoryApi.getAll().then(setItems).catch(() => {});
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add Item</h1>
        <Button variant="secondary" asChild>
          <Link to="/inventory">Back to Inventory</Link>
        </Button>
      </div>
      <QuickAddForm items={items} onSuccess={handleSuccess} />
    </div>
  );
};

export default AddItemPage;
