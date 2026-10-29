import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../components/Button/Button';
import { Legend } from '../components/Legend/Legend';
import BlurText from '../components/reactbits/BlurText';
import { SegmentedControl } from '../components/SegmentedControl/SegmentedControl';
import { Overlay } from '../components/Overlay/Overlay';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { minutesOfDay, useNow } from '../hooks/useNow';
import { useSchedule } from '../hooks/useSchedule';
import { totalsByCategory } from '../lib/blocks';
import {
  addDays,
  addMonths,
  addYears,
  formatFullDate,
  formatMonth,
  formatWeekRange,
  isSameDay,
  monthDays,
  monthGrid,
  startOfDay,
  weekDays,
} from '../lib/date';
import { DayFocus } from '../views/DayFocus';
import { MonthView } from '../views/MonthView';
import { WeekView } from '../views/WeekView';
import { YearView } from '../views/YearView';

const VIEWS = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

const FORMATS = [
  { value: '12h', label: '12h' },
  { value: '24h', label: '24h' },
];

const STEP = {
  week: (d, n) => addDays(d, n * 7),
  month: addMonths,
  year: addYears,
};

function periodDays(view, cursor) {
  if (view === 'week') return weekDays(cursor);
  if (view === 'month') return monthDays(cursor.getFullYear(), cursor.getMonth());
  return Array.from({ length: 12 }, (_, m) => monthDays(cursor.getFullYear(), m)).flat();
}

function periodTitle(view, cursor) {
  if (view === 'week') return formatWeekRange(cursor);
  if (view === 'month') return formatMonth(cursor);
  return String(cursor.getFullYear());
}

export function CalendarPage({ clockFormat, onClockFormat }) {
  const [view, setView] = useLocalStorage('clockit:view', 'week');
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [direction, setDirection] = useState(0);
  // editorDate outlives sheetOpen so the overlay keeps its content while fading out.
  const [editorDate, setEditorDate] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [focusCategory, setFocusCategory] = useState(null);
  const now = useNow();
  const nowMinutes = minutesOfDay(now);
  const today = startOfDay(now);
  const visibleDays = view === 'month' ? monthGrid(cursor) : periodDays(view, cursor);
  const schedule = useSchedule([...visibleDays, today, ...(editorDate ? [editorDate] : [])]);
  const { getBlocks } = schedule;

  const title = periodTitle(view, cursor);
  const showYear = view !== 'year';
  const totals = totalsByCategory(periodDays(view, cursor).map(getBlocks));

  const go = useCallback(
    (n) => {
      setDirection(n);
      setCursor((c) => STEP[view](c, n));
    },
    [view],
  );
  const goToday = () => {
    setDirection(0);
    setCursor(startOfDay(new Date()));
  };
  const openEditor = (date) => {
    setEditorDate(date);
    setSheetOpen(true);
  };
  const closeEditor = useCallback(() => setSheetOpen(false), []);
  const pickMonth = (date) => {
    setDirection(0);
    setCursor(date);
    setView('month');
  };

  useEffect(() => {
    const onKey = (e) => {
      if (sheetOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      const actions = {
        ArrowLeft: () => go(-1),
        ArrowRight: () => go(1),
        t: goToday,
        w: () => setView('week'),
        m: () => setView('month'),
        y: () => setView('year'),
      };
      if (e.target.closest?.('[role="radiogroup"]') && e.key.startsWith('Arrow')) return;
      actions[e.key]?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, sheetOpen, setView]);

  const viewProps = { cursor, today, nowMinutes, getBlocks, onOpen: openEditor };

  return (
    <div className="app" data-focus={focusCategory ?? undefined}>
      <div className="period">
        <div className="period-title" role="heading" aria-level={1} aria-live="polite">
          <BlurText key={`${view}-${title}`} text={title} animateBy="letters" delay={18} trigger="load" className="period-text" />
          {showYear && <span className="period-year">{cursor.getFullYear()}</span>}
        </div>
        <nav className="period-nav" aria-label="Change period">
          <Button icon="left" label={`Previous ${view}`} variant="outline" onClick={() => go(-1)} />
          <Button variant="outline" onClick={goToday}>
            Today
          </Button>
          <Button icon="right" label={`Next ${view}`} variant="outline" onClick={() => go(1)} />
        </nav>
      </div>

      <div className="toolbar">
        <SegmentedControl label="Calendar view" options={VIEWS} value={view} onChange={setView} />
        <SegmentedControl label="Time format" options={FORMATS} value={clockFormat} onChange={onClockFormat} size="sm" />
      </div>

      {schedule.error && (
        <div className="banner" role="alert">
          <span>{schedule.error}</span>
          <Button icon="close" label="Dismiss" variant="quiet" onClick={schedule.dismissError} />
        </div>
      )}

      <main className={`stage ${schedule.loading ? 'is-loading' : ''}`} aria-busy={schedule.loading}>
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={`${view}-${title}-${cursor.getFullYear()}`}
            custom={direction}
            variants={{
              enter: (d) => ({ opacity: 0, x: d * 24 }),
              center: { opacity: 1, x: 0 },
              exit: (d) => ({ opacity: 0, x: d * -24 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === 'week' && <WeekView {...viewProps} />}
            {view === 'month' && <MonthView {...viewProps} />}
            {view === 'year' && <YearView {...viewProps} onPickMonth={pickMonth} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="footer">
        <Legend totals={totals} focused={focusCategory} onFocusCategory={setFocusCategory} />
        <p className="footer-hint">Midnight at the top, noon at the bottom. Open any day to block time.</p>
      </footer>

      <Overlay
        open={sheetOpen}
        onClose={closeEditor}
        title={editorDate ? formatFullDate(editorDate) : ''}
        actions={
          <>
            <Button icon="left" label="Previous day" variant="outline" onClick={() => setEditorDate((d) => addDays(d, -1))} />
            <Button icon="right" label="Next day" variant="outline" onClick={() => setEditorDate((d) => addDays(d, 1))} />
          </>
        }
      >
        {editorDate && (
          <DayFocus
            key={editorDate.getTime()}
            date={editorDate}
            blocks={getBlocks(editorDate)}
            nowMinutes={isSameDay(editorDate, today) ? nowMinutes : null}
            schedule={schedule}
          />
        )}
      </Overlay>
    </div>
  );
}
