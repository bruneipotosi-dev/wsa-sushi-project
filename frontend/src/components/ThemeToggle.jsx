import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import './ThemeToggle.scss';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? 'Attiva modalità scura' : 'Attiva modalità chiara'}
      title={isLight ? 'Modalità scura' : 'Modalità chiara'}
    >
      <span className="theme-toggle-track">
        <Moon className="theme-toggle-icon theme-toggle-icon--moon" size={13} strokeWidth={2} aria-hidden="true" />
        <Sun className="theme-toggle-icon theme-toggle-icon--sun" size={13} strokeWidth={2} aria-hidden="true" />
        <span className="theme-toggle-thumb">
          {isLight
            ? <Sun size={13} strokeWidth={2.2} aria-hidden="true" />
            : <Moon size={13} strokeWidth={2.2} aria-hidden="true" />}
        </span>
      </span>
    </button>
  );
}
