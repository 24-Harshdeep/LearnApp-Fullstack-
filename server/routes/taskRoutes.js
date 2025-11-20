import express from 'express'
import Task from '../models/Task.js'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const { topic, difficulty } = req.query
    const filter = {}
    
    if (topic) filter.topic = topic
    if (difficulty) filter.difficulty = difficulty

    const tasks = await Task.find(filter)

    // If Authorization header is present, try to mark tasks as completed for the user
    try {
      const authHeader = req.headers.authorization || ''
      const token = authHeader.split(' ')[1]
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET)
          console.debug('[tasks] token verified for userId:', decoded.userId)
          const user = await User.findById(decoded.userId).select('completedTasks')
          if (user) {
            const completedSet = new Set((user.completedTasks || []).map(String))
            const tasksWithStatus = tasks.map(t => ({ ...t.toObject(), completed: completedSet.has(String(t._id)) }))
            return res.json(tasksWithStatus)
          }
        } catch (verifyErr) {
          // Log verification issues to help debug client/server token problems
          console.debug('[tasks] token present but verification failed:', verifyErr.message)
          // fallthrough to return plain tasks
        }
      } else {
        console.debug('[tasks] no Authorization header present')
      }
    } catch (e) {
      console.error('[tasks] unexpected error while checking token:', e.message)
      // ignore and return plain tasks
    }

    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get specific task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create new task
router.post('/', async (req, res) => {
  try {
    const task = await Task.create(req.body)
    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get task hints
router.get('/:id/hints', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).select('hints')
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json({ hints: task.hints })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Submit task solution and award XP
router.post('/:id/submit', async (req, res) => {
  try {
    const { userId, email, code } = req.body
    const taskId = req.params.id
    
    console.log('📝 Task submission:', { taskId, userId, email, hasCode: !!code })
    
    if (!code) {
      return res.status(400).json({ 
        success: false,
        message: 'Code is required' 
      })
    }

    if (!userId && !email) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID or email is required' 
      })
    }

    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      })
    }

    // Import User model
    const User = (await import('../models/User.js')).default

    // Find user by ID or email
    let user = null
    if (userId) {
      user = await User.findById(userId)
    }
    if (!user && email) {
      user = await User.findOne({ email })
    }
    
    if (!user) {
      console.error('❌ User not found:', { userId, email })
      return res.status(404).json({ 
        success: false,
        message: 'User not found. Please login again.' 
      })
    }

    // Calculate XP based on task difficulty
    const xpReward = task.xpReward || 50
    
    // Update user progress for task topic
    const taskTopic = task.topic?.toLowerCase()
    if (taskTopic && user.progress && user.progress[taskTopic] !== undefined) {
      // Increment progress by 5% per task (capped at 100)
      user.progress[taskTopic] = Math.min(100, (user.progress[taskTopic] || 0) + 5)
    }

    // Award XP to user
    user.xp += xpReward
    user.calculateLevel()
    await user.save()

    // Persist task completion for this user (idempotent)
    try {
      if (!user.completedTasks) user.completedTasks = []
      const tid = String(task._id)
      if (!user.completedTasks.map(String).includes(tid)) {
        user.completedTasks.push(tid)
        await user.save()
      }
    } catch (e) {
      console.error('Failed to persist completed task for user:', e.message)
    }

    console.log('✅ Task submitted successfully:', { 
      userId: user._id, 
      xpAwarded: xpReward, 
      newXP: user.xp,
      newLevel: user.level,
      progressUpdated: taskTopic
    })

    res.json({ 
      success: true,
      message: 'Task completed successfully!',
      xpAwarded: xpReward,
      newXP: user.xp,
      newLevel: user.level,
      progress: user.progress
    })
  } catch (error) {
    console.error('❌ Task submit error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
})

export default router
