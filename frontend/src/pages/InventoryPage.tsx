import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import InventoryTable from '../components/InventoryTable';

const InventoryPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Household Inventory</h1>
        <Button asChild>
          <Link to="/add-item">Add New Item</Link>
        </Button>
      </div>
      <InventoryTable />
    </div>
  );
};

export default InventoryPage;
