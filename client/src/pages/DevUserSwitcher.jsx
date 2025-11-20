import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Users, LogIn, RefreshCw } from 'lucide-react'

const API_URL = 'http://localhost:5000/api'

export default function DevUserSwitcher() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Fetch all LMS users (you may need to create this endpoint or use an existing one)
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      
      setUsers(response.data.users || response.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const impersonateUser = async (user) => {
    try {
      // Generate a login token for this user (requires a dev endpoint)
      // For now, we'll manually set localStorage
      const userData = {
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp || 0,
        coins: user.coins || 0,
        level: user.level || 1,
        loginStreak: user.loginStreak || 0
      }

      // Try to login as this user via the backend
      // If you don't have password, we'll create a dev endpoint
      toast.loading('Impersonating user...')
      
      // For now, try to generate token via a dev endpoint
      try {
        const response = await axios.post(`${API_URL}/lms/dev-impersonate`, {
          userId: user._id || user.id
        })
        
        if (response.data.token) {
          localStorage.setItem('lms_token', response.data.token)
          localStorage.setItem('lms_user', JSON.stringify(response.data.user))
          toast.success(`Now logged in as ${user.name}`)
          
          // Redirect based on role
          if (user.role === 'teacher') {
            navigate('/lms/teacher')
          } else {
            navigate('/hackathon/student')
          }
          return
        }
      } catch (devError) {
        console.log('Dev endpoint not available, using local storage only')
      }

      // Fallback: just set localStorage (UI will work but server calls may fail)
      localStorage.setItem('lms_user', JSON.stringify(userData))
      toast.success(`Impersonating ${user.name} (local only - some features may not work)`)
      
      // Redirect
      setTimeout(() => {
        if (user.role === 'teacher') {
          navigate('/lms/teacher')
        } else {
          navigate('/hackathon/student')
        }
      }, 1000)
      
    } catch (error) {
      console.error('Error impersonating user:', error)
      toast.error('Failed to impersonate user')
    }
  }

  const getCurrentUser = () => {
    try {
      const raw = localStorage.getItem('lms_user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  }

  const currentUser = getCurrentUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🛠️ Dev User Switcher
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Click any user to impersonate them (dev/testing only)
              </p>
            </div>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {currentUser && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300">
                <strong>Currently logged in as:</strong> {currentUser.name} ({currentUser.email}) - {currentUser.role}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div
                key={user._id || user.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-2 transition-all ${
                  currentUser && currentUser._id === (user._id || user.id)
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.role === 'teacher'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {user.role || 'student'}
                      </span>
                      {user.loginStreak > 0 && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded text-xs font-semibold">
                          🔥 {user.loginStreak} days
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <p>ID: {user._id || user.id}</p>
                  {user.xp !== undefined && <p>XP: {user.xp}</p>}
                  {user.level && <p>Level: {user.level}</p>}
                </div>

                <button
                  onClick={() => impersonateUser(user)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition shadow-lg"
                >
                  <LogIn className="w-4 h-4" />
                  Login as {user.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}
