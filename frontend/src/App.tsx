import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import InventoryPage from './pages/InventoryPage';
import AddItemPage from './pages/AddItemPage';

function Home() {
  return (
    <main className="container">
      <section className="page-header">
        <h1>Household Inventory</h1>
        <p>Manage your groceries, medications, and consumables in one place.</p>
        <nav className="page-nav" aria-label="Primary actions">
          <Link to="/inventory" className="btn">View Inventory</Link>
          <Link to="/add-item" className="btn btn-secondary">Add Item</Link>
        </nav>
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <header className="topbar" aria-label="Main navigation">
        <nav className="topbar-nav">
          <Link to="/" className="brand">Inventory</Link>
          <Link to="/inventory" className="topbar-link">Inventory</Link>
          <Link to="/add-item" className="topbar-link">Add Item</Link>
        </nav>
      </header>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/add-item" element={<AddItemPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
