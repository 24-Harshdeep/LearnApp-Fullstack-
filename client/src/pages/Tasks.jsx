import { motion } from 'framer-motion'
import { Code, CheckCircle, Clock, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { tasksAPI, aiAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Tasks() {
  const [filter, setFilter] = useState('all')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await tasksAPI.getAll()
      setTasks(response.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateTask = async () => {
    try {
      toast.loading('Generating new task...')
      const response = await aiAPI.generateTask({
        topic: 'JavaScript',
        difficulty: 'medium',
        userLevel: 5
      })
      toast.dismiss()
      toast.success('New task generated!')
      // In a real app, you'd add this to the tasks list or redirect
      console.log('Generated task:', response.data)
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to generate task')
    }
  }

  const handleStartTask = (task) => {
    toast.success(`Starting task: ${task.title}`)
    // In a real app, you'd navigate to a task editor page
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading tasks...</div>
      </div>
    )
  }

  // Use real task completion status from the task data
  const tasksWithStatus = tasks.map(task => ({
    ...task,
    status: task.completed ? 'completed' : 'available'
  }))
  
  const filteredTasks = tasksWithStatus.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Practice Tasks 💻
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-generated coding challenges to reinforce your learning
          </p>
        </div>
        
        <button className="btn-primary flex items-center space-x-2" onClick={handleGenerateTask}>
          <Zap className="w-5 h-5" />
          <span>Generate New Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        {['all', 'available', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              filter === tab
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`card ${task.status === 'locked' ? 'opacity-60' : ''}`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                task.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {task.difficulty}
              </span>
              
              <div className="flex items-center space-x-2">
                {task.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  +{task.xpReward} XP
                </span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {task.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {task.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center space-x-1">
                  <Code className="w-4 h-4" />
                  <span>{task.topic}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{task.timeEstimate}</span>
                </span>
              </div>
              
              {task.status === 'available' && (
                <button className="btn-primary" onClick={() => handleStartTask(task)}>
                  Start Task
                </button>
              )}
              {task.status === 'in-progress' && (
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg" onClick={() => handleStartTask(task)}>
                  Continue
                </button>
              )}
              {task.status === 'completed' && (
                <button className="btn-secondary" onClick={() => toast.info('Solution view coming soon!')}>
                  View Solution
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
