import { Brain, Trophy, User, Coins } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/store'
import ThemeSwitcher from './ThemeSwitcher'

export default function Navbar() {
  const { user } = useAuthStore()
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              IdleLearn
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Coins className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-800 dark:text-amber-200">
                {user?.coins || 0} Coins
              </span>
            </div>
            
            <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                {user?.xp || 0} XP
              </span>
            </div>
            
            <ThemeSwitcher />
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              <User className="w-5 h-5" />
              <span className="font-medium">{user?.name || 'Guest'}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
