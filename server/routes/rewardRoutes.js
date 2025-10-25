import express from 'express'
import User from '../models/User.js'

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
