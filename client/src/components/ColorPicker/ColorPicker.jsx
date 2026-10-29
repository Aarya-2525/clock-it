import { motion } from 'motion/react';
import { COLORS, colorValue } from '../../lib/colors';
import './ColorPicker.css';

// Row of colour swatches behaving as a radio group (arrow keys move).
export function ColorPicker({ value, onChange, label = 'Colour' }) {
  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = Math.max(
      COLORS.findIndex((c) => c.id === value),
      0,
    );
    const next = COLORS[(index + step + COLORS.length) % COLORS.length];
    onChange(next.id);
    event.currentTarget.querySelector(`[data-color="${next.id}"]`)?.focus();
  };

  return (
    <div className="colorpicker" role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {COLORS.map((c, i) => {
        const active = c.id === value;
        const reachable = active || (i === 0 && !COLORS.some((o) => o.id === value));
        return (
          <motion.button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c.label}
            title={c.label}
            data-color={c.id}
            tabIndex={reachable ? 0 : -1}
            className={`swatch ${active ? 'is-active' : ''}`}
            style={{ '--swatch': colorValue(c.id) }}
            onClick={() => onChange(c.id)}
            whileTap={{ scale: 0.88 }}
            animate={{ scale: active ? 1.08 : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          />
        );
      })}
    </div>
  );
}
