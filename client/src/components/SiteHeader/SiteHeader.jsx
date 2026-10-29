import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../Button/Button';
import { Dial } from '../Dial/Dial';
import './SiteHeader.css';

const LOGO_BLOCKS = [
  { id: 'a', start: 0, end: 420, color: 'purple' },
  { id: 'b', start: 540, end: 1020, color: 'sky' },
  { id: 'c', start: 1080, end: 1200, color: 'pink' },
];

export function SiteHeader({ theme, onToggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <NavLink to="/" className="site-brand" aria-label="clock it, home">
        <span className="site-brand-mark">
          <Dial blocks={LOGO_BLOCKS} variant="micro" animate={false} />
        </span>
        <span>clock it</span>
      </NavLink>

      <nav className="site-nav" aria-label="Main">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/calendar">Calendar</NavLink>
      </nav>

      <div className="site-actions">
        <Button
          icon={theme === 'dark' ? 'sun' : 'moon'}
          label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          variant="outline"
          onClick={onToggleTheme}
        />
        {user ? (
          <Button
            variant="outline"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Log out
          </Button>
        ) : (
          <>
            <Button variant="ghost" className="site-login" onClick={() => navigate('/login')}>
              Log in
            </Button>
            <Button variant="solid" onClick={() => navigate('/register')}>
              Sign up
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
