import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, CheckSquare, TrendingUp, Award, ShoppingBag, Users, BookOpen } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/curriculum', label: 'Curriculum', icon: BookOpen },
  { path: '/learning-path', label: 'Learning Path', icon: Map },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/social', label: 'Social Arena', icon: Users },
  { path: '/progress', label: 'Progress', icon: TrendingUp },
  { path: '/rewards', label: 'Rewards', icon: Award },
  { path: '/store', label: 'Store', icon: ShoppingBag },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
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
  )
}
