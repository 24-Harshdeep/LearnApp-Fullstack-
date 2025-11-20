import express from 'express'
import mongoose from 'mongoose'
import Curriculum from '../models/Curriculum.js'
import UserCurriculumProgress from '../models/UserCurriculumProgress.js'

const router = express.Router()

// Get all curriculums
router.get('/', async (req, res) => {
  try {
    const curriculums = await Curriculum.find({ isActive: true })
      .sort({ difficulty: 1, createdAt: 1 })
    res.json(curriculums)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single curriculum by ID
router.get('/:id', async (req, res) => {
  try {
    const curriculum = await Curriculum.findById(req.params.id)
    if (!curriculum) {
      return res.status(404).json({ error: 'Curriculum not found' })
    }
    res.json(curriculum)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get curriculum by topic
router.get('/topic/:topic', async (req, res) => {
  try {
    const curriculum = await Curriculum.findOne({ 
      topic: new RegExp(req.params.topic, 'i') 
    })
    if (!curriculum) {
      return res.status(404).json({ error: 'Curriculum not found' })
    }
    res.json(curriculum)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user's curriculum progress
router.get('/progress/:userId', async (req, res) => {
  try {
    const progress = await UserCurriculumProgress.find({ 
      userId: req.params.userId 
    }).populate('curriculumId')
    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Start curriculum (create progress record)
router.post('/start', async (req, res) => {
  try {
    const { userId, curriculumId } = req.body

    // Check if already started
    let progress = await UserCurriculumProgress.findOne({ userId, curriculumId })
    
    if (progress) {
      return res.json(progress)
    }

    // Get curriculum to initialize lessons
    const curriculum = await Curriculum.findById(curriculumId)
    if (!curriculum) {
      return res.status(404).json({ error: 'Curriculum not found' })
    }

    // Create progress with all lessons initialized
    const lessonsProgress = curriculum.subtopics.map((subtopic, index) => ({
      subtopicId: subtopic._id,
      lessonTitle: subtopic.lessonTitle,
      completed: false,
      completedTasks: [],
      startedAt: index === 0 ? new Date() : null
    }))

    progress = new UserCurriculumProgress({
      userId,
      curriculumId,
      topic: curriculum.topic,
      lessonsProgress,
      currentSubtopicIndex: 0
    })

    await progress.save()
    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Submit task solution
router.post('/submit-task', async (req, res) => {
  try {
    const { userId, curriculumId, subtopicIndex, taskIndex, submittedCode } = req.body

    const progress = await UserCurriculumProgress.findOne({ userId, curriculumId })
    if (!progress) {
      return res.status(404).json({ error: 'Progress not found. Start the curriculum first.' })
    }

    const curriculum = await Curriculum.findById(curriculumId)
    const subtopic = curriculum.subtopics[subtopicIndex]
    const task = subtopic.practicalTasks[taskIndex]

    // Simple validation (in real app, use proper code validation)
    const passed = submittedCode.trim().length > 0

    // Update progress
    const lessonProgress = progress.lessonsProgress[subtopicIndex]
    
    // Check if task already completed
    const existingTask = lessonProgress.completedTasks.find(t => t.taskIndex === taskIndex)
    
    if (!existingTask) {
      lessonProgress.completedTasks.push({
        taskIndex,
        submittedCode,
        passed,
        completedAt: new Date()
      })
    }

    // Mark lesson as completed if all tasks done
    if (lessonProgress.completedTasks.length === subtopic.practicalTasks.length) {
      lessonProgress.completed = true
      lessonProgress.completedAt = new Date()
      
      // Award XP to progress
      const xpReward = task.xpReward || 20
      if (passed) {
        progress.xpEarned += xpReward
        
        // Also update main User model for global XP tracking
        const User = (await import('../models/User.js')).default
        const user = await User.findOne({ email: progress.userId || userId })
        if (user) {
          user.xp += xpReward
          user.calculateLevel()
          await user.save()
          console.log(`✅ Awarded ${xpReward} XP to user ${user.email} for curriculum task`)
        }
      }

      // Move to next lesson
      if (subtopicIndex < curriculum.subtopics.length - 1) {
        progress.currentSubtopicIndex = subtopicIndex + 1
        progress.lessonsProgress[subtopicIndex + 1].startedAt = new Date()
      }
    }

    progress.calculateProgress()
    await progress.save()

    res.json({
      success: true,
      passed,
      xpEarned: task.xpReward || 20,
      progress: progress.totalProgress,
      message: passed 
        ? '🎉 Great job! Task completed!' 
        : '❌ Try again! Check your code.',
      nextLesson: progress.currentSubtopicIndex < curriculum.subtopics.length - 1
        ? curriculum.subtopics[progress.currentSubtopicIndex + 1].lessonTitle
        : null
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get specific lesson progress
router.get('/lesson/:userId/:curriculumId/:subtopicIndex', async (req, res) => {
  try {
    const { userId, curriculumId, subtopicIndex } = req.params
    
    const progress = await UserCurriculumProgress.findOne({ userId, curriculumId })
    const curriculum = await Curriculum.findById(curriculumId)

    if (!progress || !curriculum) {
      return res.status(404).json({ error: 'Not found' })
    }

    const lessonProgress = progress.lessonsProgress[parseInt(subtopicIndex)]
    const subtopic = curriculum.subtopics[parseInt(subtopicIndex)]

    res.json({
      lesson: subtopic,
      progress: lessonProgress,
      totalProgress: progress.totalProgress,
      currentIndex: progress.currentSubtopicIndex
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Sync curriculum progress from frontend
router.post('/sync-progress', async (req, res) => {
  try {
    const { email, curriculumId, topic, lessonIndex, lessonId } = req.body

    // Find user by email
    const User = (await import('../models/User.js')).default
    const user = await User.findOne({ email })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Find or create curriculum progress
    let progress = await UserCurriculumProgress.findOne({ 
      userId: user._id, 
      curriculumId 
    })

    const curriculum = await Curriculum.findById(curriculumId)
    if (!curriculum) {
      return res.status(404).json({ error: 'Curriculum not found' })
    }

    if (!progress) {
      // Create new progress
      const lessonsProgress = curriculum.subtopics.map((subtopic, index) => ({
        subtopicId: subtopic._id || new mongoose.Types.ObjectId(),
        lessonTitle: subtopic.title,
        completed: index === lessonIndex,
        startedAt: index <= lessonIndex ? new Date() : undefined,
        completedAt: index === lessonIndex ? new Date() : undefined
      }))

      progress = new UserCurriculumProgress({
        userId: user._id,
        curriculumId,
        topic: topic || curriculum.topic,
        currentSubtopicIndex: lessonIndex,
        lessonsProgress
      })
    } else {
      // Update existing progress
      if (lessonIndex < progress.lessonsProgress.length) {
        progress.lessonsProgress[lessonIndex].completed = true
        progress.lessonsProgress[lessonIndex].completedAt = new Date()
        if (lessonIndex > progress.currentSubtopicIndex) {
          progress.currentSubtopicIndex = lessonIndex
        }
      }
    }

    // Calculate total progress
    progress.calculateProgress()
    await progress.save()

    console.log(`📊 Progress calculated for ${topic}:`, {
      completedLessons: progress.lessonsProgress.filter(l => l.completed).length,
      totalLessons: progress.lessonsProgress.length,
      percentage: progress.totalProgress
    })

    // Update User model progress field
    const topicKey = topic.toLowerCase().replace(/\s+/g, '').replace('.', '')
    const validTopics = ['html', 'css', 'javascript', 'react', 'nodejs', 'typescript', 'python']
    
    console.log(`🔍 Topic mapping - Original: "${topic}", Key: "${topicKey}", Valid: ${validTopics.includes(topicKey)}`)
    
    if (validTopics.includes(topicKey)) {
      if (!user.progress) {
        user.progress = {}
      }
      const oldProgress = user.progress[topicKey]
      user.progress[topicKey] = progress.totalProgress
      await user.save()
      
      console.log(`✅ Updated User.progress.${topicKey}: ${oldProgress}% → ${progress.totalProgress}%`)
      console.log(`📦 Full User.progress:`, user.progress)
    } else {
      console.log(`⚠️ Topic "${topicKey}" not in valid topics list. Valid topics are:`, validTopics)
    }

    res.json({
      success: true,
      totalProgress: progress.totalProgress,
      topicKey,
      userProgressUpdated: validTopics.includes(topicKey),
      message: 'Progress synced successfully'
    })
  } catch (error) {
    console.error('❌ Sync progress error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
