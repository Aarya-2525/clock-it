import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { Button } from '../Button/Button';
import './Overlay.css';

// Full-screen layer with a title bar. `actions` sit before the close button.
export function Overlay({ open, onClose, title, actions, children }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          ref={panelRef}
          className="overlay"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="overlay-bar">
            <h2 className="overlay-title">{title}</h2>
            <div className="overlay-actions">
              {actions}
              <Button icon="close" label="Close" variant="outline" onClick={onClose} />
            </div>
          </header>
          <div className="overlay-body">{children}</div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
