import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Button } from '../components/Button/Button';
import { Composer } from '../components/Composer/Composer';
import { OrbitClock } from '../components/OrbitClock/OrbitClock';
import { useClockFormat } from '../hooks/useClockFormat';
import { blockedMinutes, isSameBlock } from '../lib/blocks';
import { blockColor, blockLabel, defaultColor } from '../lib/categories';
import { colorValue } from '../lib/colors';
import { addDays, DAY_MINUTES, formatDuration } from '../lib/date';

const EMPTY_FORM = { label: '', category: null, color: null };

export function DayFocus({ date, blocks, nowMinutes, schedule }) {
  const { time } = useClockFormat();
  const [pending, setPending] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const composing = Boolean(pending);

  const reset = () => {
    setPending(null);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  // Esc discards the draft first; a second Esc closes the overlay.
  useEffect(() => {
    if (!composing) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      reset();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [composing]);

  const pickRange = (range) => {
    if (!composing) setForm(EMPTY_FORM);
    setPending(range);
  };

  const selectBlock = (block) => {
    setEditing(block);
    setPending({ start: block.start, end: block.end });
    setForm({
      label: block.label ?? '',
      category: block.category === 'other' ? null : block.category,
      color: block.color ?? defaultColor(block.category),
    });
  };

  const confirm = () => {
    const category = form.category ?? 'other';
    const block = { ...pending, category, label: form.label.trim(), color: form.color ?? defaultColor(category) };
    if (editing) schedule.replaceBlock(date, editing, block);
    else schedule.addBlock(date, block);
    reset();
  };

  const remove = () => {
    schedule.deleteBlock(date, editing);
    reset();
  };

  const startBlank = () => {
    const from = nowMinutes === null ? 540 : Math.min(Math.ceil(nowMinutes / 15) * 15, DAY_MINUTES - 60);
    pickRange({ start: from, end: from + 60 });
  };

  return (
    <div className="focus">
      <div className="focus-clock">
        <OrbitClock
          blocks={blocks}
          now={nowMinutes}
          pending={pending}
          pendingColor={
            form.color ? colorValue(form.color) : form.label.trim() ? colorValue(defaultColor('other')) : null
          }
          selected={editing}
          onRangePick={pickRange}
          onSelectBlock={selectBlock}
        />
      </div>

      <aside className="focus-side">
        <AnimatePresence mode="wait" initial={false}>
          {composing ? (
            <Composer
              key={editing ? `edit-${editing.id}` : 'new'}
              range={pending}
              form={form}
              editing={Boolean(editing)}
              onRangeChange={setPending}
              onFormChange={setForm}
              onConfirm={confirm}
              onCancel={reset}
              onDelete={remove}
            />
          ) : (
            <div className="focus-hint" key="hint">
              <p>
                <strong>Drag around the clock</strong> to pick a time, then name it. Tap a pill to edit it.
              </p>
              <Button icon="plus" variant="solid" onClick={startBlank}>
                New block
              </Button>
            </div>
          )}
        </AnimatePresence>

        <section className="focus-list" aria-label="Blocks on this day">
          <header>
            <h3>Planned</h3>
            <span>{formatDuration(blockedMinutes(blocks))} of 24h</span>
          </header>
          {blocks.length ? (
            <ul>
              {blocks.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    className={editing && isSameBlock(editing, b) ? 'is-active' : ''}
                    onClick={() => selectBlock(b)}
                  >
                    <span className="focus-swatch" style={{ background: blockColor(b) }} />
                    <span className="focus-name">{blockLabel(b)}</span>
                    <span className="focus-time">
                      {time(b.start)} – {time(b.end)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="focus-empty">Nothing planned yet. This day is all yours.</p>
          )}
        </section>

        <div className="focus-actions">
          <Button icon="copy" variant="outline" onClick={() => schedule.copyDay(addDays(date, -1), date)}>
            Copy previous day
          </Button>
          <Button icon="trash" variant="quiet" onClick={() => schedule.clearDay(date)} disabled={!blocks.length}>
            Clear day
          </Button>
        </div>
      </aside>
    </div>
  );
}
