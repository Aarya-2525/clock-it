import { motion } from 'motion/react';
import { DayCell } from '../components/DayCell/DayCell';
import { formatMonth, isSameDay, keyOf, monthDays } from '../lib/date';

// Twelve months of tiny dials. Leading blanks align day 1 under its weekday.
export function YearView({ cursor, today, getBlocks, onOpen, onPickMonth }) {
  const year = cursor.getFullYear();

  return (
    <div className="year-grid">
      {Array.from({ length: 12 }, (_, month) => {
        const days = monthDays(year, month);
        const lead = (days[0].getDay() + 6) % 7;
        return (
          <motion.section
            key={month}
            className="year-month"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: month * 0.03, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <button type="button" className="year-month-name" onClick={() => onPickMonth(days[0])}>
              {formatMonth(days[0])}
            </button>
            <div className="year-month-grid">
              {Array.from({ length: lead }, (_, i) => (
                <span key={`lead-${i}`} />
              ))}
              {days.map((date) => (
                <DayCell
                  key={keyOf(date)}
                  date={date}
                  blocks={getBlocks(date)}
                  variant="micro"
                  isToday={isSameDay(date, today)}
                  animate={false}
                  onOpen={onOpen}
                />
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
