import { useEffect, useState } from 'react';

// Current time, refreshed every `interval` ms.
export function useNow(interval = 30_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);

  return now;
}

export const minutesOfDay = (date) => date.getHours() * 60 + date.getMinutes();
