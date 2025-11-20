import { Brain, Trophy, User, Coins, LogOut, Flame } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/store'
import socket from '../utils/socket'
import ThemeSwitcher from './ThemeSwitcher'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Navbar() {
  const { user, clearAuth, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [xpData, setXpData] = useState({ xp: 0, coins: 0, loginStreak: 0 })
  
  const lmsUser = localStorage.getItem('lms_user')
  const userData = lmsUser ? JSON.parse(lmsUser) : null
  const userRole = userData?.role || user?.role || null

  // Fetch real-time XP and coins for students
  useEffect(() => {
    // Listen for streak updates to update navbar immediately
    const handleStreak = (payload) => {
      try {
        const stored = localStorage.getItem('lms_user')
        const storedUser = stored ? JSON.parse(stored) : null
        if (!storedUser || storedUser.email !== payload.email) return

        const newData = {
          xp: storedUser.xp || xpData.xp,
          coins: storedUser.coins || xpData.coins,
          loginStreak: payload.loginStreak || (payload.streak && payload.streak.currentStreak) || xpData.loginStreak
        }

        setXpData(newData)
        // update auth store and localStorage
        updateUser({ ...storedUser, ...newData, streak: payload.streak || { currentStreak: payload.loginStreak } })
        localStorage.setItem('lms_user', JSON.stringify({ ...storedUser, ...newData, streak: payload.streak || { currentStreak: payload.loginStreak } }))
      } catch (e) {
        console.error('Navbar socket streak handler error', e)
      }
    }

    socket.on('streak:update', handleStreak)

    const fetchUserData = async () => {
      if (userRole === 'student') {
        try {
          const token = localStorage.getItem('lms_token')
          if (!token) return

          const response = await axios.get('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          if (response.data.success) {
            const newData = {
              xp: response.data.user.xp || 0,
              coins: response.data.user.coins || 0,
              loginStreak: response.data.user.loginStreak || 0
            }
            setXpData(newData)
            
            // Update store and localStorage for persistence
            updateUser(response.data.user)
            localStorage.setItem('lms_user', JSON.stringify(response.data.user))
          }
        } catch (error) {
          // Silently fail and use cached data
          setXpData({
            xp: user?.xp || userData?.xp || 0,
            coins: user?.coins || userData?.coins || 0,
            loginStreak: user?.loginStreak || userData?.loginStreak || 0
          })
        }
      }
    }

    fetchUserData()
    
    // Poll for updates every 5 seconds for faster real-time sync
    const interval = setInterval(fetchUserData, 5000)

    return () => {
      clearInterval(interval)
      socket.off('streak:update', handleStreak)
    }
  }, [userRole, user?.xp])
  
  const handleLogout = () => {
    // Clear LMS data
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user')
    // Clear app store
    clearAuth()
    // Close dropdown
    setShowDropdown(false)
    // Navigate to login
    navigate('/lms/login')
  }
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between h-auto min-h-16 items-center py-2 gap-2">
          {/* Logo - Clickable for students, static for teachers */}
          {userRole === 'teacher' ? (
            <div className="flex items-center space-x-2 cursor-default">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                IdleLearn
              </span>
            </div>
          ) : (
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                IdleLearn
              </span>
            </Link>
          )}
          
          <div className="flex items-center flex-wrap gap-2 sm:space-x-4">
            {/* Show XP and Coins only for students */}
            {userRole === 'student' && (
              <>
                {/* Login Streak Badge */}
                {xpData.loginStreak > 0 && (
                  <div className="flex items-center space-x-2 px-2 sm:px-4 py-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    <span className="font-semibold text-xs sm:text-base text-orange-800 dark:text-orange-200">
                      {xpData.loginStreak} 🔥
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2 px-2 sm:px-4 py-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  <span className="font-semibold text-xs sm:text-base text-amber-800 dark:text-amber-200">
                    {xpData.coins}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 px-2 sm:px-4 py-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                  <span className="font-semibold text-xs sm:text-base text-yellow-800 dark:text-yellow-200">
                    {xpData.xp} XP
                  </span>
                </div>
              </>
            )}
            
            <ThemeSwitcher />
            
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-2 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <div className="hidden sm:flex flex-col items-start">
                  <span className="font-medium text-sm">{user?.name || userData?.name || 'Guest'}</span>
                  {userRole && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {userRole}
                    </span>
                  )}
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg transition"
                  >
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
