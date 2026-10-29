import { motion, useReducedMotion } from 'motion/react';
import { blockColor } from '../../lib/categories';
import { DAY_MINUTES } from '../../lib/date';
import './Dial.css';

// Compact 24-hour ring for calendar grids: midnight at the top, clockwise.
// `variant` sets density: card (week), mini (month), micro (year, logo).
const VARIANTS = {
  card: { r: 40, stroke: 11, gap: 8 },
  mini: { r: 38, stroke: 15, gap: 14 },
  micro: { r: 34, stroke: 24, gap: 0 },
};

function polar(minutes, radius) {
  const a = (minutes / DAY_MINUTES) * Math.PI * 2;
  return [50 + Math.sin(a) * radius, 50 - Math.cos(a) * radius];
}

function Arc({ start, end, r, stroke, color, category, delay, animate }) {
  const len = Math.max(end - start, 0);
  const shared = {
    cx: 50,
    cy: 50,
    r,
    fill: 'none',
    stroke: color,
    'data-cat': category,
    strokeWidth: stroke,
    pathLength: DAY_MINUTES,
    strokeDashoffset: -start,
  };
  if (!animate) return <circle {...shared} strokeDasharray={`${len} ${DAY_MINUTES}`} />;
  return (
    <motion.circle
      {...shared}
      initial={{ strokeDasharray: `0 ${DAY_MINUTES}` }}
      animate={{ strokeDasharray: `${len} ${DAY_MINUTES}` }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

export function Dial({ blocks = [], variant = 'card', now = null, animate = true, children }) {
  const v = VARIANTS[variant];
  const reduced = useReducedMotion();
  const gap = v.gap / 2;
  const [nx, ny] = now === null ? [] : polar(now, v.r + v.stroke / 2 + 4);

  return (
    <div className={`dial dial--${variant}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <g transform="rotate(-90 50 50)">
          <circle cx="50" cy="50" r={v.r} fill="none" className="dial-track" strokeWidth={v.stroke} />
          {blocks.map((b, i) => (
            <Arc
              key={b.id}
              start={b.start + gap}
              end={b.end - gap}
              r={v.r}
              stroke={v.stroke}
              color={blockColor(b)}
              category={b.category}
              delay={i * 0.04}
              animate={animate && !reduced}
            />
          ))}
        </g>
        {now !== null && <circle className="dial-now" cx={nx} cy={ny} r="2.2" />}
      </svg>
      {children && <div className="dial-center">{children}</div>}
    </div>
  );
}
