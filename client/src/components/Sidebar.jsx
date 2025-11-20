import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Map, CheckSquare, TrendingUp, Award, ShoppingBag, Users, BookOpen, GraduationCap, Trophy, UserCheck, User, Rocket, Menu, X, Brain } from 'lucide-react'
import { useAuthStore } from '../store/store'
import { useState } from 'react'

// Student navigation items (Dashboard removed as requested)
const studentNavItems = [
  { path: '/curriculum', label: 'Curriculum', icon: BookOpen },
  { path: '/learning-path', label: 'Learning Path', icon: Map },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/social', label: 'Social Arena', icon: Users },
  { path: '/ai-quiz', label: 'AI Quiz', icon: Brain },
  { path: '/ai-debug-duel', label: 'Debug Duel', icon: Rocket },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  // Progress intentionally hidden for students in sidebar
  { path: '/rewards', label: 'Rewards', icon: Award },
  { path: '/store', label: 'Store', icon: ShoppingBag },
  { path: '/profile', label: 'My Profile', icon: User },
]

// Teacher-specific navigation items (6 items total as per requirement)
const teacherNavItems = [
  { path: '/lms/teacher', label: 'My Classes', icon: GraduationCap },
  { path: '/lms/teacher/students', label: 'Students', icon: UserCheck },
  { path: '/hackathon/teacher', label: 'Hackathon Sprint', icon: Rocket },
  { path: '/learning-path', label: 'Learning Path', icon: Map },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/profile', label: 'Profile', icon: User },
]

const studentItems = [
  { path: '/lms/student', label: 'My Classes', icon: GraduationCap },
  { path: '/hackathon/student', label: 'Hackathon Sprint', icon: Rocket },
]

export default function Sidebar() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const role = user?.role || JSON.parse(localStorage.getItem('lms_user') || 'null')?.role
  const [isOpen, setIsOpen] = useState(false)
  
  // Build navigation based on role
  const roleItems = role === 'teacher'
    ? teacherNavItems
    : role === 'student'
    ? [...studentItems, ...studentNavItems]
    : []

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700 
        min-h-screen p-4
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <nav className="space-y-2 mt-16 md:mt-0">
          {roleItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => { setIsOpen(false); try { navigate(item.path) } catch (e) { /* fallback */ } }}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
