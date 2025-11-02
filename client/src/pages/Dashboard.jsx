import { motion } from 'framer-motion'
import { Flame, Target, Code, Clock, Coins, Sparkles } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { useEffect, useState, useMemo } from 'react'
import { learningPathAPI, tasksAPI, progressAPI } from '../services/api'
import { useAuthStore } from '../store/store'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [modules, setModules] = useState([])
  const [tasks, setTasks] = useState([])
  const [progress, setProgress] = useState([])
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksInProgress: 0,
    totalTimeSpent: 0,
    averageAccuracy: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Calculate topic progress dynamically from real user data
  const topicData = useMemo(() => {
    // Get completed lessons from localStorage
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]')
    
    if (!modules.length) {
      return [{ name: 'Getting Started', value: 10, color: '#3b82f6' }]
    }
    
    // Filter only curriculum modules (those with subtopics)
    const curriculumModules = modules.filter(m => m.subtopics && m.subtopics.length > 0)
    
    if (!curriculumModules.length) {
      return [{ name: 'Start Learning', value: 10, color: '#3b82f6' }]
    }
    
    const colors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#06b6d4', '#f97316']
    
    // Calculate progress for each curriculum
    const data = curriculumModules.map((module, index) => {
      const totalLessons = module.subtopics.length
      const completedCount = completedLessons.filter(id => id.startsWith(module._id)).length
      const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
      
      return {
        name: module.title,
        value: progressPercent > 0 ? progressPercent : (index === 0 ? 5 : 0), // Show 5% for first topic if nothing started
        color: colors[index % colors.length]
      }
    }).filter(t => t.value > 0)
    
    return data.length > 0 ? data : [{ name: curriculumModules[0]?.title || 'Start Learning', value: 5, color: '#3b82f6' }]
  }, [modules])

  // Calculate weekly activity from real completed tasks
  const weeklyProgress = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const weekData = []
    
    // Get completed lessons with timestamps from localStorage
    const completedLessonsData = JSON.parse(localStorage.getItem('completedLessonsData') || '{}')
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayName = days[date.getDay()]
      const dateString = date.toDateString()
      
      // Count lessons completed on this day
      const dayLessons = Object.values(completedLessonsData).filter(timestamp => {
        const lessonDate = new Date(timestamp)
        return lessonDate.toDateString() === dateString
      }).length
      
      // Count tasks completed on this day (fallback)
      const dayTasks = tasks.filter(task => {
        if (!task.completedAt) return false
        const taskDate = new Date(task.completedAt)
        return taskDate.toDateString() === dateString
      }).length
      
      const totalCompleted = dayLessons + dayTasks
      
      // Estimate time (20 minutes per task/lesson)
      const estimatedHours = parseFloat(((totalCompleted * 20) / 60).toFixed(1))
      
      weekData.push({
        day: dayName,
        tasks: totalCompleted,
        time: estimatedHours
      })
    }
    
    return weekData
  }, [tasks])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [modulesRes, tasksRes, progressRes] = await Promise.all([
        learningPathAPI.getAll(),
        tasksAPI.getAll(),
        user?._id ? progressAPI.getUserProgress(user._id).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }) // Fallback for progress
      ])
      
      setModules(modulesRes.data || [])
      setTasks(tasksRes.data || [])
      setProgress(progressRes.data || [])
      
      // Calculate real stats from actual data
      const completedTasks = (tasksRes.data || []).filter(t => t.completed).length
      const inProgressTasks = (tasksRes.data || []).filter(t => !t.completed).length
      const totalTime = Math.round(completedTasks * 0.33) // ~20 min per task
      
      setStats({
        tasksCompleted: completedTasks,
        tasksInProgress: inProgressTasks,
        totalTimeSpent: totalTime,
        averageAccuracy: 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
      // Set empty arrays so the page still renders
      setModules([])
      setTasks([])
      setProgress([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Coach Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
      >
        <div className="flex items-start space-x-4">
          <img 
            src="https://em-content.zobj.net/source/apple/391/robot_1f916.png" 
            alt="AI Coach"
            className="w-16 h-16"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Hey {user?.name || 'there'}! 👋</h2>
            <p className="text-lg opacity-90 mb-3">
              Great to see you back! You're on a <strong>{user?.streak?.currentStreak || 0}-day streak</strong> 🔥
            </p>
            <p className="text-sm opacity-80">
              💡 <strong>AI Coach Tip:</strong> You have {tasks.filter(t => !t.completed).length} active tasks waiting. Let's crush them today!
            </p>
          </div>
        </div>
      </motion.div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Your Learning Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your progress and stay motivated
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          icon={Flame}
          title="Current Streak"
          value={`${user?.streak?.currentStreak || 0} days`}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
        <StatsCard
          icon={Coins}
          title="Total Coins"
          value={(user?.coins || 0).toString()}
          color="text-amber-600"
          bgColor="bg-amber-100"
        />
        <StatsCard
          icon={Target}
          title="Tasks Completed"
          value={`${stats.tasksCompleted}/${tasks.length}`}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatsCard
          icon={Code}
          title="Topics Mastered"
          value={modules.length.toString()}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatsCard
          icon={Clock}
          title="Learning Time"
          value={`${stats.totalTimeSpent}h this week`}
          color="text-green-600"
          bgColor="bg-green-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Progress Pie Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Topic Progress
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topicData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Activity Bar Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Weekly Activity
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyProgress}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasks" fill="#3b82f6" name="Tasks" />
              <Bar dataKey="time" fill="#10b981" name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current Learning Section */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Continue Learning
        </h2>
        {modules.length > 0 ? (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{modules[0]?.title || 'Start Your Journey'}</h3>
            <p className="mb-4">{modules[0]?.description || 'Begin your learning path today'}</p>
            <div className="flex items-center justify-between">
              <div className="bg-white bg-opacity-20 rounded-full h-2 flex-1 mr-4">
                <div 
                  className="bg-white rounded-full h-2" 
                  style={{ width: `${progress.find(p => p.learningPathId === modules[0]?._id)?.totalProgress || 0}%` }}
                ></div>
              </div>
              <span className="font-semibold">
                {progress.find(p => p.learningPathId === modules[0]?._id)?.totalProgress || 0}% Complete
              </span>
            </div>
            <button 
              onClick={() => window.location.href = '/learning-path'}
              className="mt-4 bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Continue Learning →
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No learning paths available yet</p>
            <button 
              onClick={() => window.location.href = '/learning-path'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Explore Learning Paths →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatsCard({ icon: Icon, title, value, color, bgColor }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="card flex items-center space-x-4"
    >
      <div className={`${bgColor} p-3 rounded-lg`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </motion.div>
  )
}
