import React, { useEffect } from 'react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  visible: boolean;
}

// Accessible live region: role=status + aria-live=polite announces removal to screen readers without interrupting.
const UndoToast: React.FC<UndoToastProps> = ({ message, onUndo, onDismiss, visible }) => {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div role="status" aria-live="polite" className="undo-toast">
      <span>{message}</span>
      <button type="button" onClick={onUndo}>Undo</button>
    </div>
  );
};

export default UndoToast;
