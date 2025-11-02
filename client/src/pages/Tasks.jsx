import { motion, AnimatePresence } from 'framer-motion'
import { Code, CheckCircle, Clock, Zap, ArrowLeft, Send, Lightbulb } from 'lucide-react'
import { useState, useEffect } from 'react'
import { tasksAPI, aiAPI } from '../services/api'
import toast from 'react-hot-toast'
import CodeEditor from '../components/CodeEditor'

export default function Tasks() {
  const [filter, setFilter] = useState('all')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState(null)
  const [userCode, setUserCode] = useState('')

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
    setActiveTask(task)
    setUserCode(task.starterCode || '// Your code here')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToList = () => {
    setActiveTask(null)
    setUserCode('')
  }

  const handleSubmitTask = async () => {
    if (!userCode.trim()) {
      toast.error('Please write some code first!')
      return
    }

    try {
      toast.loading('Submitting your solution...')
      
      // Get AI feedback
      const feedback = await aiAPI.getCodeFeedback({
        code: userCode,
        task: activeTask.title
      })
      
      toast.dismiss()
      toast.success('Solution submitted! Check the feedback.')
      
      // Display feedback
      console.log('AI Feedback:', feedback.data)
      
      // Mark task as completed (in real app, would update backend)
      toast('🎉 Task completed! +' + activeTask.xpReward + ' XP', {
        duration: 4000,
        icon: '✅'
      })
      
      // Update task status locally
      setTasks(tasks.map(t => 
        t._id === activeTask._id ? { ...t, completed: true } : t
      ))
      
      // Go back to task list after short delay
      setTimeout(() => {
        handleBackToList()
      }, 2000)
      
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to submit solution')
      console.error('Submit error:', error)
    }
  }

  const handleGetHint = async () => {
    try {
      toast.loading('Getting hint...')
      
      const hint = await aiAPI.getHint({
        taskTitle: activeTask.title,
        taskDescription: activeTask.description,
        userCode: userCode,
        attemptNumber: 1
      })
      
      toast.dismiss()
      toast(hint.data.message, {
        duration: 8000,
        icon: '💡'
      })
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to get hint')
    }
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
      <AnimatePresence mode="wait">
        {activeTask ? (
          /* Task Editor View */
          <motion.div
            key="task-editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Tasks
              </button>
              
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {activeTask.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {activeTask.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                    activeTask.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    activeTask.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {activeTask.difficulty}
                  </span>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    +{activeTask.xpReward} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            {activeTask.instructions && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Instructions
                </h3>
                <div className="text-blue-800 dark:text-blue-200 space-y-2">
                  {activeTask.instructions.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Code Editor */}
            <div>
              <CodeEditor
                value={userCode}
                onChange={setUserCode}
                language="auto"
                height="400px"
                showRunButton={true}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmitTask}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Submit Solution
              </button>
              
              <button
                onClick={handleGetHint}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <Lightbulb className="w-5 h-5" />
                Get Hint
              </button>
            </div>

            {/* Task Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Topic</div>
                <div className="font-semibold text-gray-900 dark:text-white">{activeTask.topic}</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Time</div>
                <div className="font-semibold text-gray-900 dark:text-white">{activeTask.timeEstimate}</div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Task List View */
          <motion.div
            key="task-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
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
                      <button className="btn-secondary" onClick={() => handleStartTask(task)}>
                        View Solution
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
