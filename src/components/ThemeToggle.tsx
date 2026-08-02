import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const theme = mounted ? resolvedTheme : 'dark';

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-border/70 bg-muted/70 p-1 shadow-sm ${className}`}
      role="group"
      aria-label="Choose color theme"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-label="Use light mode"
        aria-pressed={theme === 'light'}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ${
          theme === 'light'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-background hover:text-foreground'
        }`}
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-label="Use dark mode"
        aria-pressed={theme === 'dark'}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-background hover:text-foreground'
        }`}
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
