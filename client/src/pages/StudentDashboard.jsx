import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { lmsClassAPI } from '../services/lmsAPI'
import { FaUsers, FaSignInAlt, FaChalkboardTeacher, FaSignOutAlt } from 'react-icons/fa'
import CodeEditor from '../components/CodeEditor'
import { Target, Lightbulb, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentDashboard() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [lastJoined, setLastJoined] = useState(localStorage.getItem('lms_last_join_code') || '')
  const [showJoinForm, setShowJoinForm] = useState(false)
  // (Debug Duel moved to a dedicated page - sidebar link)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('lms_user') || 'null')
    if (!u || u.role !== 'student') {
      navigate('/lms/login')
      return
    }
    load()
    // Debug Duel has been moved to its own page; no inline loading here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const res = await lmsClassAPI.getAll()
      setClasses(res.data)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  const validCode = (code) => /^[A-Z0-9]{6}$/.test(code)

  const handleJoin = async (code) => {
    const c = code || joinCode.trim().toUpperCase()
    if (!validCode(c)) {
      toast.error('Enter a valid 6-character code (A-Z, 0-9)')
      return
    }
    try {
      setJoining(true)
      await lmsClassAPI.join(c)
      toast.success('Joined class successfully!')
      localStorage.setItem('lms_last_join_code', c)
      setLastJoined(c)
      setJoinCode('')
      setShowJoinForm(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Invalid join code')
    } finally {
      setJoining(false)
    }
  }

  const handleLeave = async (classId, className) => {
    if (!confirm(`Are you sure you want to leave "${className}"?`)) return
    try {
      await lmsClassAPI.leave(classId)
      toast.success('Left class successfully')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to leave class')
    }
  }

  // Debug Duel helpers
  // Debug Duel logic moved to a dedicated page (`/ai-debug-duel`)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Classes</h1>
          <p className="text-gray-500">Join classes using a 6-character code provided by your teacher.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.03 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={() => setShowJoinForm(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaSignInAlt /> Join New Class
        </motion.button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
          <div className="space-y-3">
            <button
              disabled={!lastJoined || joining}
              onClick={() => handleJoin(lastJoined)}
              className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FaSignInAlt />
              {lastJoined ? `Rejoin Last Class (${lastJoined})` : 'No Recent Class'}
            </button>
          </div>
        </motion.div>

        {/* Debug Duel moved to separate page - use Sidebar link */}

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold mb-2">Your Stats</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Total Classes:</span>
              <span className="text-2xl font-bold">{classes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Active Enrollment:</span>
              <span className="text-xl font-bold">{classes.length > 0 ? '✓' : '—'}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Classes List */}
      <div>
        <h2 className="text-xl font-bold mb-4">Enrolled Classes</h2>
        {classes.length === 0 ? (
          <div className="p-12 bg-white dark:bg-gray-800 rounded-xl text-center">
            <FaChalkboardTeacher className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't joined any classes yet.</p>
            <button
              onClick={() => setShowJoinForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Join Your First Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <motion.div 
                key={cls._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{cls.className}</h3>
                    {cls.subject && <p className="text-sm text-gray-500 dark:text-gray-400">{cls.subject}</p>}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <FaUsers /> {cls.students?.length || 0}
                  </div>
                </div>
                
                {cls.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {cls.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <FaChalkboardTeacher />
                  <span>Teacher: {cls.teacherId?.name || 'Unknown'}</span>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <button
                    onClick={() => navigate(`/lms/student/class/${cls._id}`)}
                    className="flex-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
                  >
                    Open Classroom →
                  </button>
                  <button
                    onClick={() => handleLeave(cls._id, cls.className)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FaSignOutAlt /> Leave
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Join Form Modal */}
      {showJoinForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSignInAlt className="text-3xl text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Join a Class</h3>
              <p className="text-gray-600 dark:text-gray-400">Enter the 6-character code from your teacher</p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleJoin(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Class Code</label>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="ABC123"
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center text-2xl font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Format: 6 characters (A-Z, 0-9)</p>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowJoinForm(false)
                    setJoinCode('')
                  }} 
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={joining || joinCode.length !== 6}
                  className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {joining ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Joining...
                    </>
                  ) : (
                    <>
                      <FaSignInAlt /> Join Class
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Debug Duel moved to its own page; modal removed from dashboard */}
    </div>
  )
}
