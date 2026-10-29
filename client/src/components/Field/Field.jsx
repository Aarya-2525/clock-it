import { useId } from 'react';
import './Field.css';

// Labelled form control with hint and error text, wired for screen readers.
// `as` = input (default) | textarea | select | checkbox. Extra props pass to the control,
// so HTML5 attributes (type, required, minLength, autoComplete…) keep working.
export function Field({ label, hint, error, as = 'input', children, className = '', counter, ...control }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const shared = { id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, ...control };

  if (as === 'checkbox') {
    return (
      <div className={`field field--check ${error ? 'has-error' : ''} ${className}`}>
        <label htmlFor={id}>
          <input type="checkbox" {...shared} checked={Boolean(control.value)} value={undefined} />
          <span>{label}</span>
        </label>
        {error && (
          <p id={`${id}-error`} className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  const Control = as;
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`}>
      <div className="field-top">
        <label htmlFor={id}>{label}</label>
        {counter}
      </div>
      <Control className="field-control" {...shared}>
        {children}
      </Control>
      {hint && !error && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
