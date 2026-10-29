import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { categoryColor, categoryLabel, defaultColor, PRESETS } from '../../lib/categories';
import { formatDuration } from '../../lib/date';
import { Button } from '../Button/Button';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { TimeField } from '../TimeField/TimeField';
import './Composer.css';

const PRESET_OPTIONS = PRESETS.map((c) => ({ value: c.id, label: c.label, color: categoryColor(c.id) }));

// Names a picked time range before it is saved. Nothing is written
// until the tick is pressed; the cross throws the range away.
export function Composer({ range, form, editing, onRangeChange, onFormChange, onConfirm, onCancel, onDelete }) {
  const inputRef = useRef(null);
  const validRange = range.end > range.start;
  const ready = Boolean(form.label.trim() || form.category) && validRange;

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, [editing]);

  const submit = (event) => {
    event.preventDefault();
    if (ready) onConfirm();
  };

  // Picking a preset also picks its colour; toggling it off keeps the colour.
  const pickPreset = (category) =>
    onFormChange(
      form.category === category
        ? { ...form, category: null }
        : { ...form, category, color: defaultColor(category) },
    );

  return (
    <motion.form
      className="composer"
      onSubmit={submit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
    >
      <div className="composer-head">
        <span className="composer-kicker">{editing ? 'Edit block' : 'New block'}</span>
        <span className="composer-duration">{validRange ? formatDuration(range.end - range.start) : '—'}</span>
      </div>

      <div className="composer-times">
        <TimeField label="From" value={range.start} onChange={(start) => onRangeChange({ ...range, start })} />
        <TimeField label="To" value={range.end} end onChange={(end) => onRangeChange({ ...range, end })} />
      </div>
      {!validRange && <p className="composer-error">End time needs to be after the start.</p>}

      <label className="composer-label">
        <span>Label</span>
        <input
          ref={inputRef}
          value={form.label}
          maxLength={40}
          placeholder={form.category ? categoryLabel(form.category) : 'Deep work, gym, lunch with Sam…'}
          onChange={(e) => onFormChange({ ...form, label: e.target.value })}
        />
      </label>

      <SegmentedControl label="Preset" options={PRESET_OPTIONS} value={form.category} onChange={pickPreset} />

      <div className="composer-field">
        <span>Colour</span>
        <ColorPicker value={form.color} onChange={(color) => onFormChange({ ...form, color })} />
      </div>

      <div className="composer-actions">
        {editing && (
          <Button icon="trash" variant="quiet" onClick={onDelete}>
            Delete
          </Button>
        )}
        <span className="composer-spacer" />
        <Button icon="close" label="Discard" variant="outline" size="lg" onClick={onCancel} />
        <Button
          icon="check"
          label={editing ? 'Save changes' : 'Block this time'}
          variant="solid"
          size="lg"
          type="submit"
          disabled={!ready}
        />
      </div>
    </motion.form>
  );
}
