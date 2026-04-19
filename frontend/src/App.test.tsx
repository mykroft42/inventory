import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders top navigation bar', () => {
  render(<App />);
  const header = screen.getByRole('banner');
  expect(header).toBeInTheDocument();
  // Brand link and "Inventory" nav link both appear — verify at least one is present
  expect(screen.getAllByText('Inventory').length).toBeGreaterThanOrEqual(1);
});

test('renders home page with primary action links', () => {
  render(<App />);
  expect(screen.getByText('Household Inventory')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View Inventory' })).toBeInTheDocument();
  // "Add Item" appears in both topbar and home page — use getAllByRole
  expect(screen.getAllByRole('link', { name: 'Add Item' }).length).toBeGreaterThanOrEqual(1);
});
