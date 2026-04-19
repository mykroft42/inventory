import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import InventoryPage from './pages/InventoryPage';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
