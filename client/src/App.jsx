import { useMemo } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { RequireAuth } from './components/RequireAuth';
import { SiteHeader } from './components/SiteHeader/SiteHeader';
import { ClockFormatContext } from './hooks/useClockFormat';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { formatMinutes } from './lib/date';
import { CalendarPage } from './pages/CalendarPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterPage } from './pages/RegisterPage';

// HashRouter keeps deep links working on static hosts such as GitHub Pages.
export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [clockFormat, setClockFormat] = useLocalStorage('clockit:format', '24h');
  const hour12 = clockFormat === '12h';
  const clock = useMemo(() => ({ hour12, time: (m) => formatMinutes(m, hour12) }), [hour12]);

  return (
    <HashRouter>
      <AuthProvider>
        <ClockFormatContext.Provider value={clock}>
          <SiteHeader theme={theme} onToggleTheme={toggleTheme} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/calendar"
              element={
                <RequireAuth>
                  <CalendarPage clockFormat={clockFormat} onClockFormat={setClockFormat} />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ClockFormatContext.Provider>
      </AuthProvider>
    </HashRouter>
  );
}
