import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <main className="container">
      <section className="page-header">
        <h1>Add Item</h1>
        <Link to="/inventory" className="btn btn-secondary">Back to Inventory</Link>
      </section>
      <QuickAddForm items={items} onSuccess={handleSuccess} />
    </main>
  );
};

export default AddItemPage;
