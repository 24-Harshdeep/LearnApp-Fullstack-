import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiUser, FiTrendingUp, FiAward, FiUsers } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import StudentProgressModal from '../components/StudentProgressModal'
import { useAppStore } from '../store/store'

const TeacherDashboard = () => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterOption, setFilterOption] = useState('all') // all, my-students
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgXP: 0,
    activeToday: 0,
    topPerformer: null
  })

  // read global leaderboard to merge badges/streak info when available
  const globalLeaderboard = useAppStore(state => state.leaderboard)

  useEffect(() => {
    fetchStudents()
  }, [filterOption])

  useEffect(() => {
    // Filter students based on search
    if (searchTerm) {
      const filtered = students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredStudents(filtered)
    } else {
      setFilteredStudents(students)
    }
  }, [searchTerm, students])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('lmsToken')
      
      // Try teacher endpoint first
      let endpoint = filterOption === 'my-students' 
        ? '/api/teacher/my-students' 
        : '/api/teacher/students'
      
      try {
        const { data } = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })

        if (data.success && data.students) {
          // Normalize streak field
          const normalizedStudents = data.students.map(student => ({
            ...student,
            streak: typeof student.streak === 'object' && student.streak !== null
              ? student.streak.currentStreak || 0
              : student.streak || 0
          }))

          // Merge badges and loginStreak from global leaderboard when available so teacher view matches leaderboard
          const merged = normalizedStudents.map(student => {
            const lb = (globalLeaderboard || []).find(l => l._id === student._id || l.email === student.email)
            return {
              ...student,
              badges: student.badges || lb?.badges || [],
              loginStreak: student.loginStreak ?? lb?.loginStreak ?? student.streak
            }
          })

          setStudents(merged)
          setFilteredStudents(merged)
          calculateStats(merged)
          return
        }
      } catch (teacherError) {
        console.log('Teacher endpoint failed, trying fallback...', teacherError.response?.status)
        
        // Fallback: Try to get all users
        try {
          const { data: userData } = await axios.get('http://localhost:5000/api/users')
          
          if (userData.success && userData.users) {
            // Filter only students and normalize streak
            const studentUsers = userData.users
              .filter(u => u.role === 'student' || !u.role)
              .map(student => ({
                ...student,
                streak: typeof student.streak === 'object' && student.streak !== null
                  ? student.streak.currentStreak || 0
                  : student.streak || 0
              }))

            const merged = studentUsers.map(student => {
              const lb = (globalLeaderboard || []).find(l => l._id === student._id || l.email === student.email)
              return {
                ...student,
                badges: student.badges || lb?.badges || [],
                loginStreak: student.loginStreak ?? lb?.loginStreak ?? student.streak
              }
            })

            setStudents(merged)
            setFilteredStudents(merged)
            calculateStats(merged)
            return
          }
        } catch (userError) {
          console.error('User endpoint also failed:', userError)
        }

        // Last fallback: Try LMS users
        try {
          const { data: lmsData } = await axios.get('http://localhost:5000/api/lms/auth/users', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
          
          if (lmsData && Array.isArray(lmsData)) {
            const lmsStudents = lmsData
              .filter(u => u.role === 'student')
              .map(u => ({
                ...u,
                _id: u._id || u.id || u.email,
                xp: u.points || 0,
                level: Math.floor((u.points || 0) / 100) + 1,
                streak: 0,
                lastActive: u.createdAt,
                progress: {}
              }))

            const merged = lmsStudents.map(student => {
              const lb = (globalLeaderboard || []).find(l => l._id === student._id || l.email === student.email)
              return {
                ...student,
                badges: student.badges || lb?.badges || [],
                loginStreak: student.loginStreak ?? lb?.loginStreak ?? student.streak
              }
            })

            setStudents(merged)
            setFilteredStudents(merged)
            calculateStats(merged)
            return
          }
        } catch (lmsError) {
          console.error('LMS endpoint also failed:', lmsError)
        }

        throw new Error('All endpoints failed')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Unable to fetch students. Please make sure you are logged in as a teacher.')
      setStudents([])
      setFilteredStudents([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (studentsList) => {
    const totalStudents = studentsList.length
    const avgXP = studentsList.reduce((sum, s) => sum + (s.xp || 0), 0) / totalStudents || 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const activeToday = studentsList.filter(s => 
      s.lastActive && new Date(s.lastActive) >= today
    ).length

    const topPerformer = studentsList.reduce((top, student) => 
      (!top || student.xp > top.xp) ? student : top
    , null)

    setStats({
      totalStudents,
      avgXP: Math.round(avgXP),
      activeToday,
      topPerformer
    })
  }

  const handleStudentClick = (student) => {
    setSelectedStudent(student)
    setShowModal(true)
  }

  const getProgressPercentage = (student) => {
    if (!student.progress) return 0
    const values = Object.values(student.progress)
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    return Math.round(avg)
  }

  const formatLastActive = (date) => {
    if (!date) return 'Never'
    const lastActive = new Date(date)
    const now = new Date()
    const diffMs = now - lastActive
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    
    return lastActive.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor and manage your students' progress
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<FiUsers className="w-8 h-8" />}
            title="Total Students"
            value={stats.totalStudents}
            color="blue"
          />
          <StatsCard
            icon={<FiTrendingUp className="w-8 h-8" />}
            title="Average XP"
            value={stats.avgXP}
            color="green"
          />
          <StatsCard
            icon={<FiUser className="w-8 h-8" />}
            title="Active Today"
            value={stats.activeToday}
            color="purple"
          />
          <StatsCard
            icon={<FiAward className="w-8 h-8" />}
            title="Top Performer"
            value={stats.topPerformer?.name || 'N/A'}
            color="yellow"
            isText
          />
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                         bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterOption('all')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  filterOption === 'all'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All Students
              </button>
              <button
                onClick={() => setFilterOption('my-students')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  filterOption === 'my-students'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                My Classes
              </button>
            </div>
          </div>
        </motion.div>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Students List
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {filteredStudents.length} students found
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      XP
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Streak
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Badges
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStudents.map((student, index) => (
                    <motion.tr
                      key={student._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleStudentClick(student)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                            {student.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.name || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                            {student.xp || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Level {student.level || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                            🔥 {student.streak || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.badges && student.badges.length > 0 ? (
                          <div className="text-sm font-semibold text-yellow-600">🏅 {student.badges.length}</div>
                        ) : (
                          <div className="text-sm text-gray-400">—</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                            <div
                              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                              style={{ width: `${getProgressPercentage(student)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {getProgressPercentage(student)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {formatLastActive(student.lastActive)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Student Progress Modal */}
      {showModal && selectedStudent && (
        <StudentProgressModal
          student={selectedStudent}
          onClose={() => {
            setShowModal(false)
            setSelectedStudent(null)
          }}
          onUpdate={fetchStudents}
        />
      )}
    </div>
  )
}

const StatsCard = ({ icon, title, value, color, isText }) => {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    yellow: 'from-yellow-500 to-orange-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors[color]} opacity-10 rounded-bl-full`} />
      <div className={`text-${color}-600 dark:text-${color}-400 mb-3`}>
        {icon}
      </div>
      <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">
        {title}
      </h3>
      <p className={`text-2xl font-bold text-gray-800 dark:text-white ${isText ? 'truncate' : ''}`}>
        {value}
      </p>
    </motion.div>
  )
}

export default TeacherDashboard
