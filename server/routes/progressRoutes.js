import express from 'express'
import mongoose from 'mongoose'
import UserProgress from '../models/UserProgress.js'

const router = express.Router()

// Get user's overall progress
router.get('/user/:userId', async (req, res) => {
  try {
    const progress = await UserProgress.find({ userId: req.params.userId })
      .populate('moduleId')
      .populate('taskId')
    res.json(progress)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get progress for specific module
router.get('/user/:userId/module/:moduleId', async (req, res) => {
  try {
    const progress = await UserProgress.findOne({
      userId: req.params.userId,
      moduleId: req.params.moduleId
    }).populate('moduleId')
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' })
    }
    res.json(progress)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update progress
router.post('/update', async (req, res) => {
  try {
    const { userId, taskId, moduleId, status, progressPercentage, timeSpent, accuracyScore } = req.body

    let progress = await UserProgress.findOne({ userId, taskId })

    if (progress) {
      // Update existing progress
      progress.status = status || progress.status
      progress.progressPercentage = progressPercentage || progress.progressPercentage
      progress.timeSpent = (progress.timeSpent || 0) + (timeSpent || 0)
      progress.attemptsCount += 1
      progress.accuracyScore = accuracyScore || progress.accuracyScore
      
      if (status === 'completed' && !progress.completedAt) {
        progress.completedAt = new Date()
      }
      
      await progress.save()
    } else {
      // Create new progress entry
      progress = await UserProgress.create({
        userId,
        taskId,
        moduleId,
        status: status || 'in-progress',
        progressPercentage: progressPercentage || 0,
        timeSpent: timeSpent || 0,
        attemptsCount: 1,
        accuracyScore
      })
    }

    res.json(progress)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get user statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const completed = await UserProgress.countDocuments({
      userId: req.params.userId,
      status: 'completed'
    })

    const inProgress = await UserProgress.countDocuments({
      userId: req.params.userId,
      status: 'in-progress'
    })

    const totalTimeSpent = await UserProgress.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(req.params.userId) } },
      { $group: { _id: null, total: { $sum: '$timeSpent' } } }
    ])

    const avgAccuracy = await UserProgress.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(req.params.userId), accuracyScore: { $exists: true } } },
      { $group: { _id: null, average: { $avg: '$accuracyScore' } } }
    ])

    res.json({
      tasksCompleted: completed,
      tasksInProgress: inProgress,
      totalTimeSpent: totalTimeSpent[0]?.total || 0,
      averageAccuracy: avgAccuracy[0]?.average || 0
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
