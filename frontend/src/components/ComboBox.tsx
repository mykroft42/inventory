import React, { useState, useId, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ComboBoxProps {
  value: string;
  suggestions: string[];
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder?: string;
  id?: string;
  'aria-label'?: string;
}

// Keyboard: ↑↓ navigate suggestions, Enter selects highlighted, Escape closes. WCAG 2.1 AA: role=combobox, aria-expanded, aria-activedescendant.
const ComboBox = forwardRef<HTMLInputElement, ComboBoxProps>(({
  value,
  suggestions,
  onChange,
  onSelect,
  placeholder,
  id,
  'aria-label': ariaLabel,
}, ref) => {
  // dismissed=true after selection/Escape/blur; reset to false on typing/focus
  const [dismissed, setDismissed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();

  const filtered = value
    ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    : [];

  const isOpen = filtered.length > 0 && !dismissed;

  const select = (item: string) => {
    onSelect(item);
    setDismissed(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      select(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      setDismissed(true);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={isOpen && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        aria-label={ariaLabel}
        value={value}
        placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setDismissed(false); setActiveIndex(-1); }}
        onKeyDown={handleKeyDown}
        onFocus={() => setDismissed(false)}
        onBlur={() => setTimeout(() => { setDismissed(true); setActiveIndex(-1); }, 150)}
        autoComplete="off"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          {filtered.map((item, index) => (
            <li
              key={item}
              id={`${listboxId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => select(item)}
              className={cn(
                'px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground',
                index === activeIndex && 'bg-accent text-accent-foreground'
              )}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default ComboBox;
