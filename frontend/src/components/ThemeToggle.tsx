import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
        text-sm font-medium transition-all duration-200 cursor-pointer
        ${theme === 'dark'
          ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }
        ${className}
      `}
      title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-500" />
      )}
      <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Oscuro'}</span>
    </button>
  );
}
