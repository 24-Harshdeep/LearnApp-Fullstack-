import { motion, AnimatePresence } from 'framer-motion'
import { Code, CheckCircle, Clock, Zap, ArrowLeft, Send, Play } from 'lucide-react'
import { useState, useEffect } from 'react'
import api, { tasksAPI, aiAPI } from '../services/api'
import toast from 'react-hot-toast'
import CodeEditor from '../components/CodeEditor'
import { useAuthStore, useAppStore } from '../store/store'

export default function Tasks() {
  const [filter, setFilter] = useState('all')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState(null)
  const [userCode, setUserCode] = useState('')
  const [codeOutput, setCodeOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const { user: authUser, incrementXP } = useAuthStore()
  const { refreshLeaderboard } = useAppStore()

  // Get user from either regular auth or LMS auth
  const getCurrentUser = () => {
    // Try regular auth first
    if (authUser && (authUser._id || authUser.email)) {
      return authUser
    }

    // Try LMS auth (handle multiple shapes)
    const lmsUserStr = localStorage.getItem('lms_user') || localStorage.getItem('user') || localStorage.getItem('user_data')
    if (lmsUserStr) {
      try {
        const parsed = JSON.parse(lmsUserStr)
        // possible shapes: { _id, email, name }, { user: { _id, email } }, or simple { email }
        if (parsed.user) return { ...parsed.user, ...parsed }
        if (parsed._id || parsed.email) return parsed
      } catch (e) {
        // sometimes lms_user may just be a plain id string
        if (typeof lmsUserStr === 'string' && lmsUserStr.length > 10) {
          return { _id: lmsUserStr }
        }
        console.error('Error parsing LMS user:', e)
      }
    }

    return null
  }

  const user = getCurrentUser()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      // Try to include Authorization header explicitly to ensure the server
      // can verify the token and annotate tasks with completed:true.
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      // Also try to include a userId query param (fallback for local dev when JWT
      // verification fails due to secret mismatches). getCurrentUser() parses
      // localStorage.lms_user or other shapes and returns an object with _id/email.
      const currentUser = getCurrentUser()
      const userId = currentUser?._id || currentUser?.user?._id || null
      let response
      if (token) {
        response = await api.get('/tasks', { headers: { Authorization: `Bearer ${token}` }, params: userId ? { userId } : {} })
      } else if (userId) {
        // No token but we have a stored user id — use query fallback
        response = await api.get('/tasks', { params: { userId } })
      } else {
        // Fallback to tasksAPI which relies on the interceptor
        response = await tasksAPI.getAll()
      }
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
    // If the user has previously submitted code for this task, show it;
    // otherwise show starter code placeholder.
    setUserCode(task.submittedCode || task.starterCode || '// Your code here')
    setCodeOutput('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToList = () => {
    setActiveTask(null)
    setUserCode('')
    setCodeOutput('')
  }

  const handleRunCode = () => {
    setIsRunning(true)
    setCodeOutput('')
    
    try {
      // Detect task type based on code content or topic
      const isHTML = userCode.includes('<html') || userCode.includes('<!DOCTYPE') || 
                     activeTask?.topic?.toLowerCase().includes('html')
      const hasCSS = userCode.includes('<style') || userCode.includes('css')
      
      if (isHTML || hasCSS) {
        // For HTML/CSS tasks, render in preview
        setCodeOutput('HTML_PREVIEW')
        toast.success('Preview updated!')
      } else {
        // For JavaScript tasks, execute code
        const logs = []
        const customConsole = {
          log: (...args) => logs.push(args.join(' ')),
          error: (...args) => logs.push('ERROR: ' + args.join(' ')),
          warn: (...args) => logs.push('WARNING: ' + args.join(' '))
        }
        
        // Execute code in isolated scope
        const wrappedCode = `
          (function() {
            const console = arguments[0]
            try {
              ${userCode}
            } catch (error) {
              console.error(error.message)
            }
          })(arguments[0])
        `
        
        // Execute with custom console
        const func = new Function('console', wrappedCode)
        func(customConsole)
        
        setCodeOutput(logs.length > 0 ? logs.join('\n') : '✅ Code executed successfully (no output)')
        toast.success('Code executed!')
      }
    } catch (error) {
      setCodeOutput(`❌ Error: ${error.message}`)
      toast.error('Code execution failed')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmitTask = async () => {
    if (!userCode.trim()) {
      toast.error('Please write some code first!')
      return
    }

    if (!user || (!user._id && !user.email)) {
      toast.error('Please login to submit tasks')
      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/lms/login'
      }, 1500)
      return
    }

    try {
      const loadingToast = toast.loading('Submitting your solution...')
      
      // Submit task to backend with both ID and email for better lookup
      const submitData = {
        userId: user._id,
        email: user.email,
        code: userCode
      }

      console.log('📤 Submitting task:', { taskId: activeTask._id, userId: user._id, email: user.email })

      // Send object form so backend can resolve by email or id
      const submitResponse = await tasksAPI.submit(activeTask._id, submitData)
      
      toast.dismiss(loadingToast)
      
      if (submitResponse.data.success) {
        // Update local XP using Zustand store
        const xpAwarded = submitResponse.data.xpAwarded
        incrementXP(xpAwarded)
        
        // Update progress if returned from backend
        if (submitResponse.data.progress) {
          // Update user progress in auth store if needed
          console.log('✅ Progress updated:', submitResponse.data.progress)
        }
        
        // Refresh leaderboard after XP update
        setTimeout(() => {
          refreshLeaderboard()
        }, 1000)
        
        // Show success message with XP
        toast.success(`✅ Task submitted successfully! +${xpAwarded} XP earned!`, {
          duration: 4000,
          icon: '🎉'
        })
        
        // Mark task as completed locally and save submitted code so it's
        // available when user revisits or clicks "View Solution"
        const updatedTasks = tasks.map(t => 
          t._id === activeTask._id ? { ...t, completed: true, submittedCode: userCode } : t
        )
        setTasks(updatedTasks)

        // Update activeTask so the editor shows the submitted solution
        setActiveTask(prev => prev ? { ...prev, completed: true, submittedCode: userCode } : prev)
      } else {
        toast.error(submitResponse.data.message || 'Failed to submit solution')
      }
      
    } catch (error) {
      toast.dismiss()
      console.error('❌ Submit error:', error)
      const errorMsg = error.response?.data?.message || 'Failed to submit solution. Please try again.'
      
      // If user not found, redirect to login
      if (errorMsg.includes('not found') || errorMsg.includes('login')) {
        toast.error(errorMsg + ' Redirecting to login...')
        setTimeout(() => {
          window.location.href = '/lms/login'
        }, 2000)
      } else {
        toast.error(errorMsg)
      }
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
                showRunButton={false}
              />
            </div>

            {/* Code Output */}
            {codeOutput && (
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                <h4 className="text-white font-semibold p-4 bg-gray-800 border-b border-gray-700">
                  {codeOutput === 'HTML_PREVIEW' ? '🎨 Live Preview:' : '📤 Output:'}
                </h4>
                {codeOutput === 'HTML_PREVIEW' ? (
                  // HTML/CSS Preview iframe
                  <iframe
                    srcDoc={userCode}
                    title="Code Preview"
                    sandbox="allow-scripts"
                    className="w-full h-96 bg-white border-0"
                    style={{ minHeight: '400px' }}
                  />
                ) : (
                  // JavaScript console output
                  <pre className="text-green-400 p-4 font-mono text-sm whitespace-pre-wrap">{codeOutput}</pre>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
              
              <button
                onClick={handleSubmitTask}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Submit Solution
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
