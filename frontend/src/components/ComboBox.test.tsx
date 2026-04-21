import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ComboBox from './ComboBox';

const suggestions = ['Milk', 'Bread', 'Butter', 'Cheese'];

function setup(props: Partial<React.ComponentProps<typeof ComboBox>> = {}) {
  const onChange = jest.fn();
  const onSelect = jest.fn();
  render(
    <ComboBox
      value=""
      suggestions={suggestions}
      onChange={onChange}
      onSelect={onSelect}
      placeholder="Search items..."
      {...props}
    />
  );
  return { onChange, onSelect };
}

describe('ComboBox', () => {
  test('renders a text input', () => {
    setup();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('has aria-expanded false when closed', () => {
    setup();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  test('calls onChange when user types', async () => {
    const { onChange } = setup();
    await userEvent.type(screen.getByRole('combobox'), 'M');
    expect(onChange).toHaveBeenCalledWith('M');
  });

  test('shows filtered suggestions on input', async () => {
    const onChange = jest.fn();
    const onSelect = jest.fn();
    const { rerender } = render(
      <ComboBox value="" suggestions={suggestions} onChange={onChange} onSelect={onSelect} />
    );
    rerender(
      <ComboBox value="mi" suggestions={suggestions} onChange={onChange} onSelect={onSelect} />
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.queryByText('Bread')).not.toBeInTheDocument();
  });

  test('filters by substring (not prefix-only)', () => {
    const onChange = jest.fn();
    const onSelect = jest.fn();
    render(
      <ComboBox value="utt" suggestions={suggestions} onChange={onChange} onSelect={onSelect} />
    );
    expect(screen.getByText('Butter')).toBeInTheDocument();
  });

  test('matching is case-insensitive', () => {
    const onChange = jest.fn();
    const onSelect = jest.fn();
    render(
      <ComboBox value="MILK" suggestions={suggestions} onChange={onChange} onSelect={onSelect} />
    );
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  test('shows no listbox when value is empty', () => {
    setup({ value: '' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('shows no listbox when no suggestions match', () => {
    const onChange = jest.fn();
    const onSelect = jest.fn();
    render(
      <ComboBox value="zzz" suggestions={suggestions} onChange={onChange} onSelect={onSelect} />
    );
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('calls onSelect and closes dropdown when suggestion is clicked', () => {
    const onChange = jest.fn();
    const onSelect = jest.fn();
    render(
      <ComboBox value="mi" suggestions={suggestions} onChange={onChange} onSelect={onSelect} />
    );
    fireEvent.click(screen.getByText('Milk'));
    expect(onSelect).toHaveBeenCalledWith('Milk');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('closes dropdown on Escape', () => {
    const onChange = jest.fn();
    const onSelect = jest.fn();
    render(
      <ComboBox value="mi" suggestions={suggestions} onChange={onChange} onSelect={onSelect} />
    );
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('selects highlighted option on Enter', () => {
    const onChange = jest.fn();
    const onSelect = jest.fn();
    render(
      <ComboBox value="mi" suggestions={suggestions} onChange={onChange} onSelect={onSelect} />
    );
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('Milk');
  });

  test('has aria-autocomplete attribute', () => {
    setup();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list');
  });

  test('handles empty suggestions array gracefully', () => {
    const onChange = jest.fn();
    const onSelect = jest.fn();
    render(
      <ComboBox value="abc" suggestions={[]} onChange={onChange} onSelect={onSelect} />
    );
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
