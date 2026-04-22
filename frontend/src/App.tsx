import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import InventoryPage from './pages/InventoryPage';
import AddItemPage from './pages/AddItemPage';

function App() {
  return (
    <>
      <header className="border-b" aria-label="Main navigation">
        <nav className="flex items-center gap-4 px-6 h-14">
          <Link to="/inventory" className="font-semibold text-lg mr-4">
            Inventory
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/inventory">Inventory</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/add-item">Add Item</Link>
          </Button>
        </nav>
      </header>
      <main className="px-6 py-6">
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
