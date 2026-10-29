import { CATEGORIES } from './categories';

// A block is { id, start, end, label, category, color } with times in
// minutes from midnight (start < end). Blocks may overlap.

const byStart = (a, b) => a.start - b.start || a.end - b.end;

export const isSameBlock = (a, b) => a.id === b.id;

export function totalsByCategory(days) {
  const totals = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));
  for (const blocks of days) {
    for (const b of blocks) totals[b.category] = (totals[b.category] ?? 0) + b.end - b.start;
  }
  return totals;
}

// Minutes covered by at least one block (overlaps count once).
export function blockedMinutes(blocks) {
  let total = 0;
  let reach = 0;
  for (const b of [...blocks].sort(byStart)) {
    const from = Math.max(b.start, reach);
    if (b.end > from) total += b.end - from;
    reach = Math.max(reach, b.end);
  }
  return total;
}
