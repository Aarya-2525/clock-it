import { AnimatePresence, motion } from 'motion/react';
import { useId, useRef } from 'react';
import { useClockFormat } from '../../hooks/useClockFormat';
import { useRingDrag } from '../../hooks/useRingDrag';
import { blockedMinutes, isSameBlock } from '../../lib/blocks';
import { blockColor, blockLabel } from '../../lib/categories';
import { DAY_MINUTES, formatDuration } from '../../lib/date';
import './OrbitClock.css';

// Geometry, in viewBox units. Face in the middle, a thin precise track
// around it, then four orbits where labelled blocks float as pills.
const C = 280;
const FACE = 122;
const TRACK = 134;
const ORBITS = [166, 198, 230, 262];
const PILL = 28;
const TAU = Math.PI * 2;

const polar = (minutes, r) => {
  const a = (minutes / DAY_MINUTES) * TAU;
  return [C + Math.sin(a) * r, C - Math.cos(a) * r];
};

function arcPath(start, end, r, reverse = false) {
  const stop = Math.min(end, start + DAY_MINUTES - 0.5);
  const [x1, y1] = polar(start, r);
  const [x2, y2] = polar(stop, r);
  const large = stop - start > DAY_MINUTES / 2 ? 1 : 0;
  return reverse
    ? `M${x2} ${y2} A${r} ${r} 0 ${large} 0 ${x1} ${y1}`
    : `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

function wedgePath(start, end) {
  const [x1, y1] = polar(start, FACE);
  const [x2, y2] = polar(Math.min(end, start + DAY_MINUTES - 0.5), FACE);
  const large = end - start > DAY_MINUTES / 2 ? 1 : 0;
  return `M${C} ${C} L${x1} ${y1} A${FACE} ${FACE} 0 ${large} 1 ${x2} ${y2} Z`;
}

const toMinutes = (px, r) => (px / (TAU * r)) * DAY_MINUTES;
const MAX_CHARS = 18;
const CHAR_PX = 8.8;

const pillText = (block) => {
  const text = blockLabel(block);
  return text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS - 1)}…` : text;
};

// Where a pill sits on orbit radius r: as long as its duration,
// or longer when its label needs the room (centred on the block).
function pillSpan(block, text, r) {
  const cap = toMinutes(PILL / 2, r);
  const byTime = block.end - block.start - 2 * cap - 4;
  const byText = toMinutes(text.length * CHAR_PX + 6, r);
  const body = Math.max(byTime, byText, 0);
  const mid = (block.start + block.end) / 2;
  return { start: mid - body / 2, end: mid + body / 2, cap };
}

// Greedy: each pill takes the innermost orbit that is free where it
// starts, so neighbours step outward instead of colliding.
function layoutPills(blocks) {
  const lastEnd = ORBITS.map(() => -Infinity);
  return blocks.map((block) => {
    const text = pillText(block);
    const spans = ORBITS.map((r) => pillSpan(block, text, r));
    const clear = (i) => lastEnd[i] + toMinutes(8, ORBITS[i]) <= spans[i].start - spans[i].cap;
    let orbit = ORBITS.findIndex((_, i) => clear(i));
    if (orbit === -1) orbit = lastEnd.indexOf(Math.min(...lastEnd));
    lastEnd[orbit] = spans[orbit].end + spans[orbit].cap;
    return { block, text, orbit, ...spans[orbit] };
  });
}

function Pill({ pill, id, dimmed, selected, onSelect }) {
  const { time } = useClockFormat();
  const { block, text, orbit, start, end } = pill;
  const mid = (start + end) / 2;
  const flip = mid > DAY_MINUTES / 4 && mid < (DAY_MINUTES * 3) / 4;
  const name = `${blockLabel(block)}, ${time(block.start)} to ${time(block.end)}`;

  return (
    <motion.g
      className={`orbit-pill ${selected ? 'is-selected' : ''}`}
      {...(onSelect && {
        role: 'button',
        tabIndex: 0,
        'aria-label': `Edit ${name}`,
        onPointerDown: (e) => e.stopPropagation(),
        onClick: () => onSelect(block),
        onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(block)),
      })}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: dimmed ? 0.3 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      style={{ transformOrigin: `${C}px ${C}px` }}
    >
      <title>{name}</title>
      <path
        id={id}
        d={arcPath(start, end, ORBITS[orbit], flip)}
        fill="none"
        stroke={blockColor(block)}
        strokeWidth={PILL}
        strokeLinecap="round"
        data-cat={block.category}
      />
      <text className="orbit-pill-label" dominantBaseline="central">
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
    </motion.g>
  );
}

function FaceNumbers() {
  const { hour12 } = useClockFormat();
  return (
    <g className="orbit-numbers">
      {Array.from({ length: 24 }, (_, h) => {
        const major = h % 6 === 0;
        const [x, y] = polar(h * 60, major ? 100 : 102);
        const text = hour12 ? String(h % 12 || 12) : String(h).padStart(2, '0');
        return (
          <text key={h} x={x} y={y} className={major ? 'major' : ''} textAnchor="middle" dominantBaseline="central">
            {text}
          </text>
        );
      })}
      {hour12 && (
        <>
          <text x={polar(360, 72)[0]} y={C} className="orbit-meridiem" textAnchor="middle" dominantBaseline="central">
            AM
          </text>
          <text x={polar(1080, 72)[0]} y={C} className="orbit-meridiem" textAnchor="middle" dominantBaseline="central">
            PM
          </text>
        </>
      )}
      {Array.from({ length: 24 }, (_, h) => {
        const [x1, y1] = polar(h * 60, FACE - 2);
        const [x2, y2] = polar(h * 60, FACE - (h % 6 === 0 ? 10 : 7));
        return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} className="tick" />;
      })}
    </g>
  );
}

function Hands({ minutes }) {
  const [hx, hy] = polar(minutes, 86);
  const [ax, ay] = polar(minutes, TRACK + 8);
  const [tx, ty] = polar(minutes + DAY_MINUTES / 2, 16);
  return (
    <g className="orbit-hands" pointerEvents="none">
      <line x1={C} y1={C} x2={hx} y2={hy} className="hand-hour" />
      <line x1={tx} y1={ty} x2={ax} y2={ay} className="hand-accent" />
      <circle cx={C} cy={C} r="5" className="hand-hub" />
    </g>
  );
}

export function OrbitClock({ blocks, now = null, pending, pendingColor, selected, onRangePick, onSelectBlock, readOnly = false }) {
  const uid = useId().replace(/[^\w-]/g, '');
  const svgRef = useRef(null);
  const { time } = useClockFormat();
  const { draft, handlers } = useRingDrag(svgRef, { onEnd: (range) => onRangePick?.(range) });
  const pills = layoutPills(blocks);
  const range = draft ?? pending ?? (selected && { start: selected.start, end: selected.end });
  const highlight = (draft || pending) && pendingColor ? pendingColor : null;
  const focus = Boolean(range);

  let headline;
  let caption;
  if (range) {
    headline = formatDuration(range.end - range.start);
    caption = `${time(range.start)} – ${time(range.end)}`;
  } else if (now !== null) {
    headline = time(now);
    caption = `${formatDuration(blockedMinutes(blocks))} planned`;
  } else {
    headline = formatDuration(blockedMinutes(blocks));
    caption = 'planned';
  }

  return (
    <svg
      ref={svgRef}
      className={`orbit-clock ${readOnly ? 'is-readonly' : ''}`}
      viewBox={`0 0 ${C * 2} ${C * 2}`}
      role={readOnly ? 'img' : 'group'}
      aria-label={readOnly ? 'Example day on the clock' : 'Day clock. Drag around the clock to pick a time range.'}
      {...(readOnly ? {} : handlers)}
    >
      {ORBITS.map((r) => (
        <circle key={r} cx={C} cy={C} r={r} className="orbit-guide" />
      ))}

      <circle cx={C} cy={C} r={TRACK} className="orbit-track" />
      {blocks.map((b) => (
        <path
          key={`t-${b.id}`}
          d={arcPath(b.start + 1.5, b.end - 1.5, TRACK)}
          className="orbit-track-block"
          stroke={blockColor(b)}
          data-cat={b.category}
          opacity={focus && !(selected && isSameBlock(selected, b)) ? 0.35 : 1}
        />
      ))}

      <circle cx={C} cy={C} r={FACE} className="orbit-face" />
      {range && <path d={wedgePath(range.start, range.end)} className="orbit-wedge" style={{ fill: highlight ?? 'var(--ink)' }} />}
      <FaceNumbers />

      {range && (
        <g pointerEvents="none">
          <path d={arcPath(range.start, range.end, TRACK)} className="orbit-range" style={{ stroke: highlight ?? 'var(--ink)' }} />
          {[range.start, range.end].map((m, i) => {
            const [x, y] = polar(m, TRACK);
            return <circle key={i} cx={x} cy={y} r="7" className="orbit-handle" />;
          })}
        </g>
      )}

      {now !== null && <Hands minutes={now} />}

      <g className="orbit-readout" pointerEvents="none">
        <text x={C} y={C + 40} textAnchor="middle" className="readout-main">
          {headline}
        </text>
        <text x={C} y={C + 62} textAnchor="middle" className="readout-caption">
          {caption}
        </text>
      </g>

      <AnimatePresence>
        {pills.map((pill, i) => {
          const b = pill.block;
          const isSelected = Boolean(selected && isSameBlock(selected, b));
          return (
            <Pill
              key={b.id}
              id={`${uid}-pill-${i}`}
              pill={pill}
              dimmed={focus && !isSelected}
              selected={isSelected}
              onSelect={readOnly ? null : onSelectBlock}
            />
          );
        })}
      </AnimatePresence>
    </svg>
  );
}
