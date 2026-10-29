import { useRef, useState } from 'react';
import { DAY_MINUTES } from '../lib/date';

const SNAP = 15;
const snap = (m) => Math.round(m / SNAP) * SNAP;
const clamp = (m) => Math.min(DAY_MINUTES, Math.max(0, m));

// Turns a drag around a circular SVG into a { start, end } range of minutes.
// Midnight sits at the top; dragging past it clamps instead of wrapping.
export function useRingDrag(svgRef, { onEnd, deadZone = 0.15 }) {
  const drag = useRef(null);
  const [draft, setDraft] = useState(null);

  const read = (event) => {
    const box = svgRef.current.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const angle = (Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2);
    return {
      minutes: (angle / (Math.PI * 2)) * DAY_MINUTES,
      radius: Math.hypot(dx, dy) / (box.width / 2),
    };
  };

  const range = ({ anchor, travel }) => {
    const end = clamp(anchor + travel);
    return { start: snap(Math.min(anchor, end)), end: snap(Math.max(anchor, end)) };
  };

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    const { minutes, radius } = read(event);
    if (radius < deadZone) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { anchor: minutes, last: minutes, travel: 0 };
    setDraft(range(drag.current));
  };

  const onPointerMove = (event) => {
    if (!drag.current) return;
    const { minutes } = read(event);
    let delta = minutes - drag.current.last;
    if (delta > DAY_MINUTES / 2) delta -= DAY_MINUTES;
    if (delta < -DAY_MINUTES / 2) delta += DAY_MINUTES;
    drag.current.last = minutes;
    drag.current.travel += delta;
    setDraft(range(drag.current));
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    let result = range(drag.current);
    if (result.end - result.start < SNAP) {
      // A tap suggests one hour from the nearest quarter.
      const start = Math.min(Math.floor(drag.current.anchor / SNAP) * SNAP, DAY_MINUTES - 60);
      result = { start, end: start + 60 };
    }
    drag.current = null;
    setDraft(null);
    onEnd(result);
  };

  return {
    draft,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}
