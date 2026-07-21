import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import './ThemeToggle.scss';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro';

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <span className="theme-toggle-track">
        <span className={`theme-toggle-thumb ${isDark ? 'theme-toggle-thumb--dark' : ''}`}>
          {isDark ? <Moon size={13} strokeWidth={2} /> : <Sun size={13} strokeWidth={2} />}
        </span>
      </span>
    </button>
  );
}
