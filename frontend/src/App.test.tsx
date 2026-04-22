import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders top navigation bar', () => {
  render(
    <MemoryRouter initialEntries={['/inventory']}>
      <App />
    </MemoryRouter>
  );
  const header = screen.getByRole('banner');
  expect(header).toBeInTheDocument();
  expect(screen.getAllByText('Inventory').length).toBeGreaterThanOrEqual(1);
});

test('root URL renders inventory list and not the old Home landing content', () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
  );
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.queryByRole('link', { name: 'View Inventory' })).not.toBeInTheDocument();
});

test('unknown route renders inventory list not old Home landing content', () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
  );
  render(
    <MemoryRouter initialEntries={['/nonexistent']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.queryByRole('link', { name: 'View Inventory' })).not.toBeInTheDocument();
});

test('nav bar contains exactly 2 unique destination hrefs: /inventory and /add-item', () => {
  render(
    <MemoryRouter initialEntries={['/inventory']}>
      <App />
    </MemoryRouter>
  );
  const nav = screen.getByRole('banner');
  const anchors = nav.querySelectorAll('a');
  const hrefs = Array.from(new Set(Array.from(anchors).map(a => a.getAttribute('href'))));
  expect(hrefs.sort()).toEqual(['/add-item', '/inventory']);
  expect(hrefs).not.toContain('/');
});
