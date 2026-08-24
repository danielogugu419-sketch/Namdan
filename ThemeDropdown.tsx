import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThemeMode } from '../types';

interface ThemeOption {
  id: ThemeMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

export const ThemeDropdown: React.FC = () => {
  const { theme, themeMode, setThemeMode } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Theme options specification (Requirement 2)
  const themeOptions: ThemeOption[] = [
    {
      id: 'light',
      label: 'Light',
      description: 'Clean high-contrast light theme',
      icon: Sun,
      iconColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/40'
    },
    {
      id: 'dark',
      label: 'Dark',
      description: 'Eye-friendly deep dark theme',
      icon: Moon,
      iconColor: 'text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/40'
    },
    {
      id: 'system',
      label: 'System',
      description: 'Sync with OS device preferences',
      icon: Laptop,
      iconColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-800/40'
    }
  ];

  // =========================================================================
  // DROPDOWN DISMISSAL LOGIC:
  // - Listens for clicks outside of the dropdown container to auto-close.
  // - Listens for the Escape key to close the menu for keyboard accessibility.
  // =========================================================================
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectTheme = (mode: ThemeMode) => {
    // Updates theme state, triggers persistence to localStorage, and updates DOM class
    setThemeMode(mode);
    setIsOpen(false);
  };

  // Determine current active trigger icon based on mode
  const renderTriggerIcon = () => {
    if (themeMode === 'system') {
      return (
        <div className="relative flex items-center justify-center">
          <Laptop className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
        </div>
      );
    }
    if (theme === 'dark') {
      return <Moon className="w-5 h-5 text-indigo-400" />;
    }
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div ref={dropdownRef} className="relative shrink-0">
      {/* 
        HEADER THEME TOGGLE BUTTON (Requirement 1):
        - Accessible 44px touch target.
        - Displays Sun icon for Light, Moon icon for Dark, or Laptop icon for System.
      */}
      <button
        id="theme-toggle-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme settings"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`Current theme: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} (${theme} active)`}
        className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 border ${
          isOpen
            ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-500/50 shadow-xs'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        {renderTriggerIcon()}
      </button>

      {/* 
        THEME POPOVER DROPDOWN MENU (Requirement 2):
        - Renders 3 selectable options: Light, Dark, System.
        - Displays distinctive icons, descriptive subtitles, and active checkmark indicator.
      */}
      {isOpen && (
        <div
          id="theme-dropdown-menu"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="theme-toggle-btn"
          className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        >
          {/* Header section with active indicator */}
          <div className="px-3 py-2.5 mb-1 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Appearance & Theme
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                Active: <span className="text-blue-600 dark:text-blue-400 font-bold capitalize">{themeMode}</span>
                {themeMode === 'system' && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1 font-normal">
                    ({theme} mode active)
                  </span>
                )}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Live Switch
            </span>
          </div>

          {/* Options List */}
          <div className="space-y-1">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = themeMode === option.id;

              return (
                <button
                  key={option.id}
                  id={`theme-option-${option.id}`}
                  role="menuitem"
                  type="button"
                  onClick={() => handleSelectTheme(option.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Theme Option Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${option.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Theme Option Info */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold ${
                        isSelected 
                          ? 'text-blue-700 dark:text-blue-400' 
                          : 'text-slate-800 dark:text-slate-100'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  {/* Active Checkmark Indicator */}
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 ml-2 shadow-xs animate-in zoom-in-75 duration-150">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note on auto sync */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 px-3 py-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Saved to browser storage</span>
            <span className="font-semibold text-slate-500 dark:text-slate-400">NEMDAN UI</span>
          </div>
        </div>
      )}
    </div>
  );
};
