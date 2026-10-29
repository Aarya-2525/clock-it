import { motion } from 'motion/react';
import { blockedMinutes } from '../../lib/blocks';
import { formatDuration, formatFullDate, WEEKDAY_LABELS } from '../../lib/date';
import { Dial } from '../Dial/Dial';
import './DayCell.css';

// A clickable day. Same component in every view; `variant` picks the density:
// card (week), mini (month), micro (year).
export function DayCell({ date, blocks, variant, isToday, outside, nowMinutes, onOpen, animate = true }) {
  const weekday = WEEKDAY_LABELS[(date.getDay() + 6) % 7];
  const day = date.getDate();
  const blocked = blockedMinutes(blocks);

  return (
    <motion.button
      type="button"
      className={`day day--${variant} ${isToday ? 'is-today' : ''} ${outside ? 'is-outside' : ''}`}
      onClick={() => onOpen(date)}
      aria-label={`${formatFullDate(date)}, ${blocked ? `${formatDuration(blocked)} blocked` : 'nothing blocked'}`}
      whileHover={variant === 'micro' ? { scale: 1.25 } : { y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {variant === 'card' && (
        <span className="day-head">
          <span className="day-weekday">{weekday}</span>
          <span className="day-number">{day}</span>
        </span>
      )}

      <Dial
        blocks={blocks}
        variant={variant}
        now={isToday ? nowMinutes : null}
        animate={animate}
      >
        {variant === 'mini' && <span className="day-number">{day}</span>}
      </Dial>

      {variant === 'card' && <span className="day-meta">{blocked ? formatDuration(blocked) : 'Nothing planned'}</span>}
    </motion.button>
  );
}
