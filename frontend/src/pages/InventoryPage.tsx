import React from 'react';
import InventoryList from '../components/InventoryList';

const InventoryPage: React.FC = () => {
  return (
    <div className="container">
      <h1>Household Inventory</h1>
      <InventoryList />
      <a href="/" className="btn">Back to Home</a>
    </div>
  );
};

export default InventoryPage;