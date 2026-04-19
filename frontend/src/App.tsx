import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import InventoryPage from './pages/InventoryPage';
import AddItemPage from './pages/AddItemPage';

function Home() {
  return (
    <div className="container">
      <h1>Household Inventory</h1>
      <p>Manage your groceries, medications, and consumables</p>
      <a href="/inventory" className="btn">View Inventory</a>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/add-item" element={<AddItemPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
