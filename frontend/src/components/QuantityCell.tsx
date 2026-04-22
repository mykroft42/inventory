import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InventoryItem } from '../services/inventoryApi';

interface QuantityCellProps {
  item: InventoryItem;
  isUpdating: boolean;
  editingQty: { id: number; value: string; error: string } | null;
  onDecrement: () => void;
  onIncrement: () => void;
  onStartEdit: () => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (value: string) => void;
}

const QuantityCell: React.FC<QuantityCellProps> = ({
  item,
  isUpdating,
  editingQty,
  onDecrement,
  onIncrement,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onEditChange,
}) => {
  const isEditing = editingQty?.id === item.id;

  return (
    <div
      className={`flex items-center gap-1 ${isUpdating ? 'opacity-50' : ''}`}
      role="group"
      aria-label={`Quantity controls for ${item.name}`}
    >
      <Button
        variant="outline"
        size="icon"
        type="button"
        disabled={item.quantity === 0 || isUpdating}
        onClick={onDecrement}
        aria-label={`Decrease quantity of ${item.name} by 1`}
        className="h-7 w-7"
      >
        −
      </Button>

      {isEditing ? (
        <span className="flex items-center gap-1">
          <Input
            type="number"
            aria-label="Inline quantity"
            value={editingQty!.value}
            min="0"
            autoFocus
            className="h-7 w-16 text-center"
            onChange={e => onEditChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') onCommitEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
            onBlur={onCommitEdit}
          />
          {editingQty!.error && (
            <span className="text-destructive text-xs">{editingQty!.error}</span>
          )}
        </span>
      ) : (
        <button
          type="button"
          aria-label={`Edit quantity of ${item.name}, currently ${isUpdating ? 'updating' : item.quantity}`}
          onClick={onStartEdit}
          className="min-w-[2rem] text-center px-1 hover:underline"
        >
          {isUpdating ? '…' : item.quantity}
        </button>
      )}

      <Button
        variant="outline"
        size="icon"
        type="button"
        disabled={isUpdating}
        onClick={onIncrement}
        aria-label={`Increase quantity of ${item.name} by 1`}
        className="h-7 w-7"
      >
        +
      </Button>
    </div>
  );
};

export default QuantityCell;
