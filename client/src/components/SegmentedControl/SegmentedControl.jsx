import { motion } from 'motion/react';
import { useId } from 'react';
import './SegmentedControl.css';

// Radio-group pill with a sliding thumb. Options may carry a `color` dot.
export function SegmentedControl({ options, value, onChange, label, size = 'md' }) {
  const id = useId();

  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = options.findIndex((o) => o.value === value);
    const next = options[(Math.max(index, 0) + step + options.length) % options.length];
    onChange(next.value);
    event.currentTarget.querySelector(`[data-value="${next.value}"]`)?.focus();
  };

  return (
    <div className={`segmented segmented--${size}`} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((option, index) => {
        const active = option.value === value;
        const reachable = active || (index === 0 && !options.some((o) => o.value === value));
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={reachable ? 0 : -1}
            data-value={option.value}
            className={`segmented-option ${active ? 'is-active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {active && (
              <motion.span
                layoutId={`thumb-${id}`}
                className="segmented-thumb"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            {option.color && <span className="segmented-dot" style={{ background: option.color }} />}
            <span className="segmented-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
