import express from 'express'
import User from '../models/User.js'
import LMSUser from '../models/LMSUser.js'
import { protect, isTeacher } from '../middleware/lmsAuth.js'

const router = express.Router()

// Get user's badges
router.get('/badges/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('badges')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ badges: user.badges })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get badges for current authenticated user or by query params
// GET /api/rewards/badges?userId=... or ?email=...
router.get('/badges', async (req, res) => {
  try {
    const { userId, email } = req.query

    let user = null
    if (userId) {
      user = await User.findById(userId).select('badges')
    } else if (email) {
      user = await User.findOne({ email }).select('badges')
    } else if (req.user && req.user._id) {
      // If route is called with authentication middleware applied, use req.user
      user = await User.findById(req.user._id).select('badges')
    }

    if (!user) {
      return res.status(400).json({ message: 'Provide userId or email query param, or call with authentication' })
    }

    return res.json({ badges: user.badges })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

// Award badge to user
router.post('/badges/:userId', async (req, res) => {
  try {
    const { badgeId } = req.body
    const user = await User.findById(req.params.userId)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if badge already awarded
    const hasBadge = user.badges.some(b => b.badgeId === badgeId)
    if (hasBadge) {
      return res.status(400).json({ message: 'Badge already awarded' })
    }

    user.badges.push({ badgeId, earnedAt: new Date() })
    await user.save()

    res.json({ message: 'Badge awarded', badges: user.badges })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get unlocked rewards
router.get('/unlocked/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('unlockedRewards xp')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ unlockedRewards: user.unlockedRewards, xp: user.xp })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Unlock reward
router.post('/unlock/:userId', async (req, res) => {
  try {
    const { rewardId, requiredXP } = req.body
    const user = await User.findById(req.params.userId)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.xp < requiredXP) {
      return res.status(400).json({ message: 'Insufficient XP' })
    }

    if (user.unlockedRewards.includes(rewardId)) {
      return res.status(400).json({ message: 'Reward already unlocked' })
    }

    user.unlockedRewards.push(rewardId)
    await user.save()

    res.json({ message: 'Reward unlocked', unlockedRewards: user.unlockedRewards })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

/**
 * POST /api/rewards/award
 * Award points/coins to a student. Body: { studentId, teacherId?, points, reason?, timestamp? }
 */
router.post('/award', protect, isTeacher, async (req, res) => {
  try {
    // Defense-in-depth: ensure authenticated user is a teacher
    if (!req.user || req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Access denied. Teacher role required.' })
    }
    const { studentId, studentEmail, teacherId, points, reason, timestamp } = req.body

    const pts = parseInt(points, 10)
    if ((!studentId && !studentEmail) || !pts || pts <= 0) {
      return res.status(400).json({ success: false, message: 'studentId or studentEmail and positive points are required' })
    }

    // If teacherId provided, ensure it matches the authenticated teacher
    if (teacherId && String(teacherId) !== String(req.user._id)) {
      console.warn(`Teacher ID mismatch: body=${teacherId} auth=${req.user._id}`)
      return res.status(403).json({ success: false, message: 'Teacher authorization mismatch' })
    }

    // Find LMS user (student) and increment their points (teacher-facing ledger)
    let lmsStudent = null
    if (studentId) {
      lmsStudent = await LMSUser.findByIdAndUpdate(studentId, { $inc: { points: pts } }, { new: true })
    }
    // If not found by id, try by email (leaderboard may hold canonical User ids)
    if (!lmsStudent && studentEmail) {
      lmsStudent = await LMSUser.findOneAndUpdate({ email: studentEmail }, { $inc: { points: pts } }, { new: true })
    }

    if (!lmsStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    // Update regular User coins and optionally XP
    const user = await User.findOneAndUpdate(
      { email: lmsStudent.email },
      { $inc: { coins: pts, xp: pts } },
      { new: true }
    )

    if (user) {
      // Recalculate level from xp
      try { user.calculateLevel(); await user.save(); } catch (e) { /* ignore */ }
    }

    // Log the award (server-side) for debugging
    console.log(`Awarded ${pts} points to ${lmsStudent.email} by teacher ${req.user.email} - reason: ${reason || 'n/a'} at ${timestamp || new Date().toISOString()}`)

    return res.json({
      success: true,
      message: `Awarded ${pts} points to ${lmsStudent.name}`,
      student: {
        _id: lmsStudent._id,
        name: lmsStudent.name,
        points: lmsStudent.points
      },
      user: user ? { _id: user._id, coins: user.coins, xp: user.xp, level: user.level } : null
    })
  } catch (error) {
    console.error('Error in /api/rewards/award:', error)
    return res.status(500).json({ success: false, message: 'Failed to award points', error: error.message })
  }
})

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { timeframe = 'all' } = req.query
    
    // For weekly leaderboard, you'd filter by date
    const users = await User.find()
      .select('name xp level')
      .sort({ xp: -1 })
      .limit(10)

    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
