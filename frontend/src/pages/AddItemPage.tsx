import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddItemForm from '../components/AddItemForm';

const AddItemPage: React.FC = () => {
  const navigate = useNavigate();

  const handleItemAdded = () => {
    // Navigate back to inventory page
    navigate('/inventory');
  };

  return (
    <div className="container">
      <h1>Add New Item</h1>
      <AddItemForm onItemAdded={handleItemAdded} />
      <a href="/inventory" className="btn">Back to Inventory</a>
    </div>
  );
};

export default AddItemPage;