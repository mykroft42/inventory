import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import UndoToast from './UndoToast';

describe('UndoToast', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('does not render when visible is false', () => {
    render(
      <UndoToast message="Item removed" onUndo={jest.fn()} onDismiss={jest.fn()} visible={false} />
    );
    expect(screen.queryByText('Item removed')).not.toBeInTheDocument();
  });

  test('renders message and undo button when visible', () => {
    render(
      <UndoToast message="Item removed" onUndo={jest.fn()} onDismiss={jest.fn()} visible />
    );
    expect(screen.getByText('Item removed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
  });

  test('has role="status" and aria-live="polite"', () => {
    const { container } = render(
      <UndoToast message="Removed" onUndo={jest.fn()} onDismiss={jest.fn()} visible />
    );
    const toast = container.querySelector('[role="status"]');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  test('calls onUndo when undo button is clicked', async () => {
    const onUndo = jest.fn();
    render(
      <UndoToast message="Item removed" onUndo={onUndo} onDismiss={jest.fn()} visible />
    );
    await userEvent.click(screen.getByRole('button', { name: /undo/i }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  test('calls onDismiss after 5 seconds', () => {
    const onDismiss = jest.fn();
    render(
      <UndoToast message="Item removed" onUndo={jest.fn()} onDismiss={onDismiss} visible />
    );
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(5000); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('does not call onDismiss before 5 seconds', () => {
    const onDismiss = jest.fn();
    render(
      <UndoToast message="Item removed" onUndo={jest.fn()} onDismiss={onDismiss} visible />
    );
    act(() => { jest.advanceTimersByTime(4999); });
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
