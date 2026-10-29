import CountUp from '../reactbits/CountUp';
import { CATEGORIES, categoryColor } from '../../lib/categories';
import './Legend.css';

// Category key with hour totals. Hovering or focusing an item
// spotlights that category on every dial via `onFocusCategory`.
export function Legend({ totals, focused, onFocusCategory }) {
  return (
    <ul className="legend" onMouseLeave={() => onFocusCategory(null)}>
      {CATEGORIES.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            className={`legend-item ${focused && focused !== c.id ? 'is-dim' : ''}`}
            aria-pressed={focused === c.id}
            onMouseEnter={() => onFocusCategory(c.id)}
            onFocus={() => onFocusCategory(c.id)}
            onBlur={() => onFocusCategory(null)}
            onClick={() => onFocusCategory(focused === c.id ? null : c.id)}
          >
            <span className="legend-dot" style={{ background: categoryColor(c.id) }} />
            <span className="legend-label">{c.label}</span>
            <span className="legend-hours">
              <CountUp to={Math.round(totals[c.id] / 60)} duration={0.9} mode="roll" trigger="load" />
              <span className="legend-unit">h</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
