import { DayCell } from '../components/DayCell/DayCell';
import { isSameDay, keyOf, weekDays } from '../lib/date';

export function WeekView({ cursor, today, nowMinutes, getBlocks, onOpen }) {
  return (
    <div className="week-grid">
      {weekDays(cursor).map((date) => (
        <DayCell
          key={keyOf(date)}
          date={date}
          blocks={getBlocks(date)}
          variant="card"
          isToday={isSameDay(date, today)}
          nowMinutes={nowMinutes}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
