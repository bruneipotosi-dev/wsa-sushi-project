import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Intrappola il focus dentro l'elemento restituito mentre isActive è true:
// Tab/Shift+Tab ciclano solo tra gli elementi focusabili al suo interno,
// Esc chiama onClose, e il focus torna all'elemento che aveva aperto il
// dialog (es. il bottone cliccato) quando isActive torna false.
export function useFocusTrap(isActive, onClose) {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    triggerRef.current = document.activeElement;
    const container = containerRef.current;
    const focusable = container?.querySelectorAll(FOCUSABLE_SELECTOR);
    (focusable?.[0] ?? container)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !container) return;

      const items = container.querySelectorAll(FOCUSABLE_SELECTOR);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus?.();
    };
  }, [isActive, onClose]);

  return containerRef;
}
