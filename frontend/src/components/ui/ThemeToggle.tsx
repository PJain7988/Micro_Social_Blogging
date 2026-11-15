import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export interface ThemeToggleProps {
  variant?: 'icon' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon', className }) => {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();

  if (variant === 'segmented') {
    const modes: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
      { mode: 'light', label: 'Light', icon: <Sun size={15} /> },
      { mode: 'dark', label: 'Dark', icon: <Moon size={15} /> },
      { mode: 'system', label: 'System', icon: <Monitor size={15} /> },
    ];

    return (
      <div className={cn('inline-flex p-1 bg-paper border border-line rounded-xl space-x-1', className)}>
        {modes.map(({ mode, label, icon }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            className={cn(
              'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              theme === mode
                ? 'bg-surface text-accent shadow-xs'
                : 'text-mute hover:text-ink'
            )}
            title={`${label} Mode`}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'p-2.5 rounded-full text-mute hover:text-ink hover:bg-paper transition-all relative group',
        className
      )}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle color theme"
    >
      {isDark ? (
        <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform" />
      ) : (
        <Moon size={20} className="text-slate-600 group-hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};
