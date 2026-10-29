import { createContext, useContext } from 'react';
import { formatMinutes } from '../lib/date';

// App-wide 12h / 24h preference. `time(minutes)` formats with it.
export const ClockFormatContext = createContext({
  hour12: false,
  time: (minutes) => formatMinutes(minutes),
});

export const useClockFormat = () => useContext(ClockFormatContext);
