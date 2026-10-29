import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { keyOf } from '../lib/date';

const monthKey = (date) => keyOf(date).slice(0, 7);
const monthRange = (month) => {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}` };
};
const byStart = (a, b) => a.start - b.start || a.end - b.end;
const EMPTY = [];

// Loads the signed-in user's blocks month by month from the API.
// `dates` = days currently on screen; their months are fetched once.
export function useSchedule(dates) {
  const [days, setDays] = useState({});
  const [loaded, setLoaded] = useState({}); // month -> 'ready' | 'error'
  const [error, setError] = useState('');
  const requested = useRef(new Set());

  const wanted = [...new Set(dates.map(monthKey))].sort().join(',');

  useEffect(() => {
    for (const month of wanted.split(',')) {
      if (requested.current.has(month)) continue;
      requested.current.add(month);
      api('/blocks', { query: monthRange(month) })
        .then(({ blocks }) => {
          setDays((prev) => {
            const next = Object.fromEntries(Object.entries(prev).filter(([k]) => !k.startsWith(month)));
            for (const b of blocks) (next[b.date] ??= []).push(b);
            return next;
          });
          setLoaded((l) => ({ ...l, [month]: 'ready' }));
        })
        .catch((err) => {
          // Forget the request so the month is retried next time it is shown.
          requested.current.delete(month);
          setError(err.message);
          setLoaded((l) => ({ ...l, [month]: 'error' }));
        });
    }
  }, [wanted]);

  const getBlocks = useCallback((date) => days[keyOf(date)] ?? EMPTY, [days]);
  const setDay = (date, fn) => setDays((prev) => ({ ...prev, [keyOf(date)]: fn(prev[keyOf(date)] ?? []) }));

  // Every change is confirmed by the server before it shows.
  const run = async (task) => {
    setError('');
    try {
      await task();
    } catch (err) {
      setError(err.message);
    }
  };

  const toBody = (date, b) => ({
    date: keyOf(date),
    start: b.start,
    end: b.end,
    label: b.label ?? '',
    category: b.category,
    color: b.color,
  });

  return {
    getBlocks,
    loading: wanted.split(',').some((m) => !loaded[m]),
    error,
    dismissError: () => setError(''),
    addBlock: (date, block) =>
      run(async () => {
        const { block: saved } = await api('/blocks', { method: 'POST', body: toBody(date, block) });
        setDay(date, (list) => [...list, saved].sort(byStart));
      }),
    replaceBlock: (date, previous, block) =>
      run(async () => {
        const { block: saved } = await api(`/blocks/${previous.id}`, { method: 'PUT', body: toBody(date, block) });
        setDay(date, (list) => list.map((b) => (b.id === previous.id ? saved : b)).sort(byStart));
      }),
    deleteBlock: (date, block) =>
      run(async () => {
        await api(`/blocks/${block.id}`, { method: 'DELETE' });
        setDay(date, (list) => list.filter((b) => b.id !== block.id));
      }),
    clearDay: (date) =>
      run(async () => {
        await api('/blocks', { method: 'DELETE', query: { date: keyOf(date) } });
        setDay(date, () => []);
      }),
    copyDay: (from, to) =>
      run(async () => {
        const { blocks } = await api('/blocks/copy', { method: 'POST', body: { from: keyOf(from), to: keyOf(to) } });
        setDay(to, () => blocks);
      }),
  };
}
