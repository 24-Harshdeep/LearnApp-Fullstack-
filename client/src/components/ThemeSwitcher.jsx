import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/store';
import { useThemeStore } from '../store/store';

const ThemeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { theme, setTheme } = useThemeStore();
  
  const themes = [
    {
      id: 'light',
      name: 'Light',
      icon: '☀️',
      colors: ['#ffffff', '#f3f4f6', '#3b82f6'],
      free: true,
    },
    {
      id: 'dark',
      name: 'Dark',
      icon: '🌙',
      colors: ['#1f2937', '#111827', '#3b82f6'],
      rewardId: 'dark-theme',
      price: 50,
    },
    {
      id: 'ocean',
      name: 'Ocean',
      icon: '🌊',
      colors: ['#023e8a', '#0077b6', '#00b4d8'],
      rewardId: 'ocean-theme',
      price: 75,
    },
  ];

  const isThemeUnlocked = (themeData) => {
    if (themeData.free) return true;
    return user?.unlockedRewards?.includes(themeData.rewardId);
  };

  const handleThemeChange = (themeId, themeData) => {
    if (isThemeUnlocked(themeData)) {
      setTheme(themeId);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-200 border border-white/20 dark:border-gray-700"
      >
        <span className="text-xl">
          {themes.find((t) => t.id === theme)?.icon || '🎨'}
        </span>
        <span className="hidden sm:inline text-sm font-medium">Theme</span>
      </button>

      {/* Theme Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Theme Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Choose Theme
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Unlock themes in the Store
                </p>
              </div>

              <div className="p-2 space-y-1">
                {themes.map((themeData) => {
                  const unlocked = isThemeUnlocked(themeData);
                  const isActive = theme === themeData.id;

                  return (
                    <motion.button
                      key={themeData.id}
                      onClick={() => handleThemeChange(themeData.id, themeData)}
                      disabled={!unlocked}
                      whileHover={unlocked ? { scale: 1.02 } : {}}
                      whileTap={unlocked ? { scale: 0.98 } : {}}
                      className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center justify-between ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : unlocked
                          ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                          : 'opacity-50 cursor-not-allowed text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{themeData.icon}</span>
                        <div className="text-left">
                          <div className="font-medium flex items-center gap-2">
                            {themeData.name}
                            {isActive && (
                              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          {!unlocked && (
                            <div className="text-xs opacity-75">
                              🪙 {themeData.price} coins
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Color Preview */}
                        <div className="flex gap-1">
                          {themeData.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-4 h-4 rounded-full border border-white/30"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        {!unlocked && (
                          <span className="text-lg">🔒</span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Quick Dark Mode Toggle */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={() => {
                    const newTheme = theme === 'light' ? 'dark' : 'light';
                    if (newTheme === 'dark' && !isThemeUnlocked(themes.find(t => t.id === 'dark'))) {
                      return;
                    }
                    setTheme(newTheme);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-900 dark:text-white flex items-center justify-center gap-2"
                >
                  {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
