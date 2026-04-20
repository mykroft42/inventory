import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AddItemForm from '../components/AddItemForm';

const AddItemPage: React.FC = () => {
  const navigate = useNavigate();

  const handleItemAdded = () => {
    // Navigate back to inventory page
    navigate('/inventory');
  };

  return (
    <main className="container">
      <section className="page-header">
        <h1>Add New Item</h1>
        <Link to="/inventory" className="btn btn-secondary">Back to Inventory</Link>
      </section>
      <AddItemForm onItemAdded={handleItemAdded} />
    </main>
  );
};

export default AddItemPage;