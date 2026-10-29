import { DayCell } from '../components/DayCell/DayCell';
import { isSameDay, keyOf, monthGrid, WEEKDAY_LABELS } from '../lib/date';

export function MonthView({ cursor, today, nowMinutes, getBlocks, onOpen }) {
  return (
    <div className="month">
      <div className="month-weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="month-grid">
        {monthGrid(cursor).map((date) => (
          <DayCell
            key={keyOf(date)}
            date={date}
            blocks={getBlocks(date)}
            variant="mini"
            isToday={isSameDay(date, today)}
            outside={date.getMonth() !== cursor.getMonth()}
            nowMinutes={nowMinutes}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}
