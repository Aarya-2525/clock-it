import { useId, useState } from 'react';
import { useClockFormat } from '../../hooks/useClockFormat';
import { DAY_MINUTES, parseTime } from '../../lib/date';
import './TimeField.css';

const STEP = 15;

// Free-typed time input. Accepts "945", "9:45", "21:45", "9:45pm"…;
// ↑ / ↓ nudge by 15 minutes. `end` lets midnight mean 24:00.
export function TimeField({ label, value, onChange, end = false }) {
  const id = useId();
  const { time } = useClockFormat();
  const [draft, setDraft] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const shown = draft ?? time(value);

  const normalise = (minutes) => (end && minutes === 0 ? DAY_MINUTES : minutes);

  const commit = () => {
    if (draft === null) return;
    const parsed = parseTime(draft);
    setDraft(null);
    if (parsed === null) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onChange(normalise(parsed));
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
      // Keep the value selected so typing again replaces it.
      const input = event.currentTarget;
      requestAnimationFrame(() => input.select());
      return;
    }
    const dir = { ArrowUp: 1, ArrowDown: -1 }[event.key];
    if (!dir) return;
    event.preventDefault();
    const base = draft === null ? value : (parseTime(draft) ?? value);
    const next = Math.min(DAY_MINUTES, Math.max(0, (Math.round(base / STEP) + dir) * STEP));
    setDraft(null);
    setInvalid(false);
    onChange(next);
  };

  return (
    <div className={`timefield ${invalid ? 'is-invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={shown}
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          setDraft(e.target.value);
          setInvalid(false);
        }}
        onBlur={commit}
        onKeyDown={onKeyDown}
      />
      {invalid && (
        <span id={`${id}-error`} className="timefield-error">
          Try 9:30, 1430 or 2:30pm
        </span>
      )}
    </div>
  );
}
