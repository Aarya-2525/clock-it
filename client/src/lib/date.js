// Small date helpers. Weeks start on Monday.

export const DAY_MINUTES = 1440;

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, amount) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function addMonths(date, amount) {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + amount);
  return d;
}

export function addYears(date, amount) {
  const d = new Date(date);
  d.setDate(1);
  d.setFullYear(d.getFullYear() + amount);
  return d;
}

export function startOfWeek(date) {
  const d = startOfDay(date);
  const offset = (d.getDay() + 6) % 7;
  return addDays(d, -offset);
}

export function keyOf(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(a, b) {
  return keyOf(a) === keyOf(b);
}

export function weekDays(date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// Six rows of seven days covering the month, padded with neighbours.
export function monthGrid(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function monthDays(year, month) {
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => new Date(year, month, i + 1));
}

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const fmt = (options) => new Intl.DateTimeFormat(undefined, options);
const monthLong = fmt({ month: 'long' });
const monthShort = fmt({ month: 'short' });
const fullDate = fmt({ weekday: 'long', month: 'long', day: 'numeric' });

export const formatMonth = (date) => monthLong.format(date);
export const formatMonthShort = (date) => monthShort.format(date);
export const formatFullDate = (date) => fullDate.format(date);

export function formatWeekRange(date) {
  const [first, last] = [startOfWeek(date), addDays(startOfWeek(date), 6)];
  const sameMonth = first.getMonth() === last.getMonth();
  return sameMonth
    ? `${formatMonthShort(first)} ${first.getDate()} – ${last.getDate()}`
    : `${formatMonthShort(first)} ${first.getDate()} – ${formatMonthShort(last)} ${last.getDate()}`;
}

const pad = (n) => String(n).padStart(2, '0');

export function formatMinutes(minutes, hour12 = false) {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = pad(minutes % 60);
  if (!hour12) return minutes === DAY_MINUTES ? '24:00' : `${pad(h24)}:${m}`;
  return `${h24 % 12 || 12}:${m} ${h24 < 12 ? 'AM' : 'PM'}`;
}

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// Reads what people type: "9", "945", "9:45", "21:45", "9:45 pm", "9p".
// Returns minutes from midnight, or null when it can't be read.
export function parseTime(text) {
  const match = text.trim().toLowerCase().replace(/\s+/g, '').replace('.', ':').match(/^(\d{1,2})(?::?(\d{2}))?(am|pm|a|p)?$/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3];
  if (minutes > 59) return null;
  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    hours = (hours % 12) + (meridiem.startsWith('p') ? 12 : 0);
  } else if (hours > 24 || (hours === 24 && minutes > 0)) {
    return null;
  }
  return hours * 60 + minutes;
}
