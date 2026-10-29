import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

const systemTheme = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage('clockit:theme', systemTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return [theme, toggle];
}
