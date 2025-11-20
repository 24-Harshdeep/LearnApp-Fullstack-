import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/store';
import { useThemeStore } from '../store/store';
import { Lock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ThemeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedLockedTheme, setSelectedLockedTheme] = useState(null);
  const user = useAuthStore((state) => state.user);
  const { theme, setTheme } = useThemeStore();
  
  // Get user role and XP with proper fallback
  const lmsUser = localStorage.getItem('lms_user');
  const userData = lmsUser ? JSON.parse(lmsUser) : null;
  const userRole = user?.role || userData?.role;
  const isTeacher = userRole === 'teacher';
  const userXP = user?.xp || userData?.xp || 0;
  const userId = user?._id || userData?._id;

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
    }
  }, []);
  
  // XP thresholds for theme unlocking
  const xpThresholds = {
    'dark-theme': 100,
    'ocean-theme': 250,
    'forest-theme': 250,
    'sunset-theme': 500,
    'minimal-theme': 100,
    'matrix-theme': 500,
    'neon-theme': 500,
    'grey-theme': 100,
  };
  
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
      xpRequired: 100,
    },
    {
      id: 'ocean',
      name: 'Oceanic Blue',
      icon: '🌊',
      colors: ['#023e8a', '#0077b6', '#00b4d8'],
      rewardId: 'ocean-theme',
      price: 75,
      xpRequired: 250,
    },
    {
      id: 'forest',
      name: 'Forest Green',
      icon: '🌲',
      colors: ['#1b4332', '#2d6a4f', '#52b788'],
      rewardId: 'forest-theme',
      price: 75,
      xpRequired: 250,
    },
    {
      id: 'sunset',
      name: 'Sunset Glow',
      icon: '🌅',
      colors: ['#fb5607', '#ff006e', '#ffbe0b'],
      rewardId: 'sunset-theme',
      price: 100,
      xpRequired: 500,
    },
    {
      id: 'minimal',
      name: 'Minimal Light',
      icon: '⚪',
      colors: ['#f8f9fa', '#e9ecef', '#495057'],
      rewardId: 'minimal-theme',
      price: 50,
      xpRequired: 100,
    },
    {
      id: 'matrix',
      name: 'Dark Matrix',
      icon: '💚',
      colors: ['#0d1117', '#1a1e26', '#00ff41'],
      rewardId: 'matrix-theme',
      price: 100,
      xpRequired: 500,
    },
    {
      id: 'neon',
      name: 'Neon Violet',
      icon: '💜',
      colors: ['#2b0548', '#5a189a', '#c77dff'],
      rewardId: 'neon-theme',
      price: 100,
      xpRequired: 500,
    },
    {
      id: 'grey',
      name: 'Classic Grey',
      icon: '⚫',
      colors: ['#495057', '#6c757d', '#adb5bd'],
      rewardId: 'grey-theme',
      price: 50,
      xpRequired: 100,
    },
  ];

  const isThemeUnlocked = (themeData) => {
    if (themeData.free) return true;
    if (isTeacher) return true; // All themes unlocked for teachers
    
    // For students, check XP threshold
    if (themeData.xpRequired) {
      return userXP >= themeData.xpRequired;
    }
    
    return user?.unlockedRewards?.includes(themeData.rewardId);
  };

  const handleThemeChange = async (themeId, themeData) => {
    const unlocked = isThemeUnlocked(themeData);
    
    if (!unlocked) {
      // Show unlock modal for students
      setSelectedLockedTheme(themeData);
      setShowUnlockModal(true);
      return;
    }
    
    // Apply theme
    setTheme(themeId);
    localStorage.setItem('theme', themeId);
    setIsOpen(false);
    
    // Persist to backend if user is logged in
    if (userId) {
      try {
        await axios.patch(`${API_URL}/users/${userId}/theme`, { theme: themeId });
        console.log('✅ Theme saved to backend:', themeId);
      } catch (error) {
        console.error('Failed to save theme to backend:', error);
        // Continue anyway - local storage will work
      }
    }
    
    toast.success(`✨ ${themeData.name} theme activated!`);
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
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsOpen(false)}
            />

            {/* Theme Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[9999] max-h-[500px] overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Choose Theme
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isTeacher ? 'All themes unlocked for teachers! 🎉' : 'Unlock themes in the Store'}
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
                          {!unlocked && !isTeacher && (
                            <div className="text-xs opacity-75 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {themeData.xpRequired} XP required
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

                        {!unlocked && !isTeacher && (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Quick Dark Mode Toggle */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 sticky bottom-0">
                <button
                  onClick={() => {
                    const newTheme = theme === 'light' ? 'dark' : 'light';
                    setTheme(newTheme);
                    localStorage.setItem('theme', newTheme);
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

      {/* Theme Unlock Modal */}
      <AnimatePresence>
        {showUnlockModal && selectedLockedTheme && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center"
              onClick={() => setShowUnlockModal(false)}
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
              >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-4xl">{selectedLockedTheme.icon}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                  Theme Locked
                </h3>

                {/* Message */}
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  🎯 Unlock <strong>{selectedLockedTheme.name}</strong> theme by reaching{' '}
                  <strong className="text-purple-600 dark:text-purple-400">
                    {selectedLockedTheme.xpRequired} XP
                  </strong>
                  !
                </p>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Your XP: {userXP}</span>
                    <span>Required: {selectedLockedTheme.xpRequired}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((userXP / selectedLockedTheme.xpRequired) * 100, 100)}%`,
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    />
                  </div>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {selectedLockedTheme.xpRequired - userXP > 0
                      ? `${selectedLockedTheme.xpRequired - userXP} XP more needed`
                      : 'Unlocked! 🎉'}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUnlockModal(false)}
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowUnlockModal(false);
                      window.location.href = '/tasks'; // Redirect to tasks to earn XP
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                  >
                    Earn XP
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
