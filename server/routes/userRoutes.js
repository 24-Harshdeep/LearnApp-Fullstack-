import express from 'express'
import User from '../models/User.js'
import LMSUser from '../models/LMSUser.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { protect } from '../middleware/lmsAuth.js'
import { getIO } from '../socket.js'

const router = express.Router()

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      xp: user.xp,
      token
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Update login streak
    const streakInfo = user.updateLoginStreak()
    await user.save()

    // Emit real-time streak update
    try {
      const io = getIO()
      io.emit('streak:update', {
        email: user.email,
        loginStreak: user.loginStreak,
        streak: user.streak || null
      })
    } catch (e) {
      console.warn('Socket IO not available to emit streak:update', e.message)
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    })

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      loginStreak: user.loginStreak,
      streakInfo,
      token
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get user profile with calculated progress
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Calculate overall progress percentage
    const progressValues = Object.values(user.progress || {})
    const totalProgress = progressValues.reduce((acc, val) => acc + val, 0)
    const progressPercentage = progressValues.length > 0 
      ? Math.round(totalProgress / progressValues.length) 
      : 0

    // Calculate completed tasks (approximation based on XP)
    const completedTasks = Math.floor(user.xp / 50) // Assuming 50 XP per task
    
    // Enhance response with calculated data
    const enhancedUser = {
      ...user.toObject(),
      progressPercentage,
      completedTasksCount: completedTasks,
      totalXP: user.xp,
      currentLevel: user.level,
      nextLevelXP: (user.level * 200), // XP needed for next level
      xpProgress: user.xp % 200 // Progress towards next level
    }

    res.json(enhancedUser)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ message: error.message })
  }
})

// Update user XP and level
router.patch('/:id/xp', async (req, res) => {
  try {
    const { xpToAdd } = req.body
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.xp += xpToAdd
    user.calculateLevel()
    await user.save()

    res.json({ xp: user.xp, level: user.level })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Award XP by email (works for curriculum completion, etc.)
router.post('/award-xp', async (req, res) => {
  try {
    const { email, xpToAdd, reason } = req.body
    
    if (!email || !xpToAdd) {
      return res.status(400).json({ message: 'Email and xpToAdd are required' })
    }

    // Find user by email
    const user = await User.findOne({ email })
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const oldXP = user.xp || 0
    user.xp = (user.xp || 0) + xpToAdd
    user.calculateLevel()
    await user.save()

    console.log(`🎁 XP awarded: ${email} earned +${xpToAdd} XP (${oldXP} → ${user.xp}) - Reason: ${reason || 'N/A'}`)

    res.json({ 
      success: true,
      xp: user.xp, 
      level: user.level,
      xpAdded: xpToAdd,
      message: `+${xpToAdd} XP earned!`
    })
  } catch (error) {
    console.error('XP award error:', error)
    res.status(500).json({ message: error.message })
  }
})

// Update user theme preference
router.patch('/:id/theme', async (req, res) => {
  try {
    const { theme } = req.body
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.preferences.selectedTheme = theme
    user.preferences.theme = theme
    await user.save()

    res.json({ 
      success: true,
      theme: user.preferences.selectedTheme,
      message: 'Theme updated successfully' 
    })
  } catch (error) {
    console.error('Theme update error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
})

// Get all users (for leaderboard)
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ xp: -1 })
      .limit(100)
    
    res.json({
      success: true,
      users,
      total: users.length
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
})

// Get current user's full profile with real-time data
router.get('/me', protect, async (req, res) => {
  try {
    // Get LMS user
    const lmsUser = await LMSUser.findById(req.user._id)
      .populate('classesJoined', 'className subject')
      .populate('classesCreated', 'className subject')
      .select('-password')
    
    if (!lmsUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      })
    }

    // Get regular User data for progress tracking
    const userData = await User.findOne({ email: lmsUser.email })
      .select('-password')
    
    // Merge both data sources
    const fullProfile = {
      _id: lmsUser._id,
      name: lmsUser.name,
      email: lmsUser.email,
      role: lmsUser.role,
      photoURL: lmsUser.photoURL,
      // LMS data
      points: lmsUser.points || 0,
      classesJoined: lmsUser.classesJoined || [],
      classesCreated: lmsUser.classesCreated || [],
      // User data (progress tracking)
      xp: userData?.xp || lmsUser.points || 0,
      level: userData?.level || Math.floor((lmsUser.points || 0) / 100) + 1,
      coins: userData?.coins || 0,
      streak: userData?.streak || { currentStreak: 0, longestStreak: 0 },
      loginStreak: userData?.loginStreak || 0,
      lastLoginDate: userData?.lastLoginDate || null,
      progress: userData?.progress || {
        html: 0,
        css: 0,
        javascript: 0,
        react: 0,
        nodejs: 0,
        typescript: 0,
        python: 0
      },
      confidenceIndex: userData?.confidenceIndex || 50,
      badges: userData?.badges || [],
      preferences: userData?.preferences || {
        theme: 'light',
        notifications: true,
        learningGoal: 'full-stack'
      },
      lastActive: userData?.lastActive || lmsUser.createdAt,
      createdAt: lmsUser.createdAt
    }

    console.log('📊 Sending profile data:', {
      name: fullProfile.name,
      loginStreak: fullProfile.loginStreak,
      xp: fullProfile.xp,
      progress: fullProfile.progress
    })

    res.json({
      success: true,
      user: fullProfile
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
})

// Get leaderboard with merged User + LMSUser data
router.get('/leaderboard', async (req, res) => {
  try {
    // Get all LMS users
    const lmsUsers = await LMSUser.find({ role: 'student' }).select('-password').lean()
    
    // For each LMS user, get their User document with XP/progress
    const leaderboardData = await Promise.all(
      lmsUsers.map(async (lmsUser) => {
        const user = await User.findOne({ email: lmsUser.email }).lean()
        
        return {
          _id: lmsUser._id,
          name: lmsUser.name,
          email: lmsUser.email,
          xp: user?.xp || lmsUser.points || 0,
          level: user?.level || Math.floor((lmsUser.points || 0) / 100) + 1,
          loginStreak: user?.loginStreak || 0,
          progress: user?.progress || {},
          coins: user?.coins || 0,
          badges: user?.badges || []
        }
      })
    )
    
    // Sort by XP (highest first)
    leaderboardData.sort((a, b) => b.xp - a.xp)
    
    // Add rank
    const rankedData = leaderboardData.map((user, index) => ({
      ...user,
      rank: index + 1
    }))
    
    console.log(`📊 Leaderboard fetched: ${rankedData.length} students`)
    
    res.json({
      success: true,
      users: rankedData,
      total: rankedData.length
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
})

export default router
