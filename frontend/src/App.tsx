import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import InventoryPage from './pages/InventoryPage';
import AddItemPage from './pages/AddItemPage';

function App() {
  return (
    <>
      <header className="topbar" aria-label="Main navigation">
        <nav className="topbar-nav">
          <Link to="/inventory" className="brand">Inventory</Link>
          <Link to="/inventory" className="topbar-link">Inventory</Link>
          <Link to="/add-item" className="topbar-link">Add Item</Link>
        </nav>
      </header>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/inventory" replace />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/add-item" element={<AddItemPage />} />
          <Route path="*" element={<Navigate to="/inventory" replace />} />
        </Routes>
      </main>
      <Toaster />
    </>
  );
}

export default App;
