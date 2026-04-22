import React from 'react';
import { Link } from 'react-router-dom';
import InventoryList from '../components/InventoryList';

const InventoryPage: React.FC = () => {
  return (
    <div className="container">
      <section className="page-header">
        <h1>Household Inventory</h1>
        <div className="action-bar">
          <Link to="/add-item" className="btn">Add New Item</Link>
        </div>
      </section>
      <InventoryList />
    </div>
  );
};

export default InventoryPage;