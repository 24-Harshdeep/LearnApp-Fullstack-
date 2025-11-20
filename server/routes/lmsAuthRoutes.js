import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import LMSUser from '../models/LMSUser.js'
import User from '../models/User.js'
import { generateToken } from '../middleware/lmsAuth.js'
import { getIO } from '../socket.js'
import { verifyGoogleToken } from '../services/googleAuth.js'

const router = express.Router()

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, googleId } = req.body

    console.log('📝 Register attempt:', { name, email, role, hasPassword: !!password, hasGoogleId: !!googleId })

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ 
        error: 'Name, email, and role are required' 
      })
    }

    // For non-Google auth, password is required
    if (!googleId && !password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be teacher or student' })
    }

    // Check if user already exists in LMSUser
    const existingLMSUser = await LMSUser.findOne({ email })
    if (existingLMSUser) {
      return res.status(409).json({ error: 'User with this email already exists' })
    }

    // Hash password (only if not Google auth)
    const hashedPassword = googleId ? undefined : await bcrypt.hash(password, 10)

    // Create new LMS user
    const lmsUser = new LMSUser({
      firebaseUid: googleId || `manual_${email.replace(/[@.]/g, '_')}`,
      name,
      email,
      password: hashedPassword,
      role,
      googleId
    })

    await lmsUser.save()
    console.log('✅ LMS User created:', lmsUser._id)

    // Check if regular User exists (for progress tracking)
    let regularUser = await User.findOne({ email })
    
    if (!regularUser) {
      regularUser = new User({
        name,
        email,
        password: hashedPassword || 'google_auth',
        role,
        xp: 0,
        level: 1,
        coins: 0,
        progress: {
          html: 0,
          css: 0,
          javascript: 0,
          react: 0,
          nodejs: 0,
          typescript: 0
        },
        confidenceIndex: 50,
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: new Date()
        },
        lastActive: new Date()
      })

      await regularUser.save()
      console.log('✅ Regular User created:', regularUser._id)
    } else {
      console.log('ℹ️ Regular User already exists:', regularUser._id)
    }

    const token = generateToken(lmsUser._id)

    res.status(201).json({
      message: 'Registration successful!',
      success: true,
      token,
      user: {
        _id: lmsUser._id,
        name: lmsUser.name,
        email: lmsUser.email,
        role: lmsUser.role
      }
    })
  } catch (error) {
    console.error('❌ Registration error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Login existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password, googleId } = req.body

    console.log('🔐 Login attempt:', { email, hasPassword: !!password, hasGoogleId: !!googleId })

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // For non-Google auth, password is required
    if (!googleId && !password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    // Find user
    const user = await LMSUser.findOne({ email })

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    console.log('👤 User found:', { id: user._id, email: user.email, role: user.role, hasPassword: !!user.password, hasGoogleId: !!user.googleId })

    // For Google auth, verify googleId
    if (googleId) {
      if (user.googleId !== googleId) {
        return res.status(401).json({ error: 'Invalid Google account' })
      }
    } else {
      // For regular auth, verify password
      if (!user.password) {
        return res.status(401).json({ error: 'This account uses Google Sign-In. Please use Google to login.' })
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password)
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }
    }

    const token = generateToken(user._id)
    console.log('✅ Login successful for:', user.email)
    // Also update login streak for the regular User record (progress tracking)
    try {
      let loginStreak = 0
      let streakInfo = null
      const regularUser = await User.findOne({ email: user.email })
      if (regularUser) {
        streakInfo = regularUser.updateLoginStreak()
        await regularUser.save()
        loginStreak = regularUser.loginStreak
        console.log('✅ Login streak updated for login route:', streakInfo)

        // Emit real-time streak update via Socket.IO
        try {
          const io = getIO()
          io.emit('streak:update', {
            email: regularUser.email,
            loginStreak: regularUser.loginStreak,
            streak: regularUser.streak || null
          })
        } catch (e) {
          // Socket may not be initialized in some environments (dev)
          console.warn('Socket IO not available to emit streak:update', e.message)
        }
      }

      res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points,
          photoURL: user.photoURL,
          loginStreak,
          streakInfo
        }
      })
    } catch (err) {
      console.error('❌ Error updating login streak on login:', err)
      // Even if streak update fails, still return login success
      res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points,
          photoURL: user.photoURL
        }
      })
    }
  } catch (error) {
    console.error('❌ Login error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Google OAuth Login/Register
router.post('/google-login', async (req, res) => {
  try {
    const { token, role } = req.body

    console.log('🔐 Google OAuth attempt:', { hasToken: !!token, role })

    if (!token) {
      return res.status(400).json({ error: 'Google token is required' })
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(token)

    if (!googleUser || !googleUser.email) {
      return res.status(401).json({ error: 'Invalid Google token' })
    }

    console.log('✅ Google token verified:', { email: googleUser.email, name: googleUser.name, emailVerified: googleUser.emailVerified })

    // Check if user exists in LMSUser
    let lmsUser = await LMSUser.findOne({ email: googleUser.email })

    if (!lmsUser) {
      // Create new user if doesn't exist
      if (!role || !['teacher', 'student'].includes(role)) {
        return res.status(400).json({ error: 'Role is required for new users (teacher or student)' })
      }

      console.log('📝 Creating new Google user:', { email: googleUser.email, role })

      lmsUser = new LMSUser({
        firebaseUid: googleUser.googleId,
        googleId: googleUser.googleId,
        name: googleUser.name,
        email: googleUser.email,
        role: role,
        photoURL: googleUser.picture,
        emailVerified: googleUser.emailVerified
      })

      await lmsUser.save()
      console.log('✅ LMS User created via Google:', lmsUser._id)
    } else {
      console.log('ℹ️ Existing LMS user logging in:', lmsUser._id)
      
      // Update existing LMS user with Google info if needed
      let updated = false
      if (!lmsUser.googleId) {
        lmsUser.googleId = googleUser.googleId
        updated = true
      }
      if (!lmsUser.photoURL && googleUser.picture) {
        lmsUser.photoURL = googleUser.picture
        updated = true
      }
      if (!lmsUser.name && googleUser.name) {
        lmsUser.name = googleUser.name
        updated = true
      }
      lmsUser.emailVerified = googleUser.emailVerified
      
      if (updated) {
        await lmsUser.save()
        console.log('✅ Updated LMS user with Google info')
      }
    }

    // Ensure regular User exists for progress tracking (for both new and existing users)
    let regularUser = await User.findOne({ email: googleUser.email })
    
    if (!regularUser) {
      console.log('📝 Creating regular User for Google login')
      regularUser = new User({
        name: googleUser.name || lmsUser.name,
        email: googleUser.email,
        password: 'google_auth',
        role: lmsUser.role,
        xp: 0,
        level: 1,
        coins: 0,
        progress: {
          html: 0,
          css: 0,
          javascript: 0,
          react: 0,
          nodejs: 0,
          typescript: 0
        },
        confidenceIndex: 50,
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: new Date()
        },
        lastActive: new Date(),
        loginStreak: 0,
        lastLoginDate: null
      })

      await regularUser.save()
      console.log('✅ Regular User created via Google:', regularUser._id)
    } else {
      console.log('ℹ️ Regular User already exists:', regularUser._id)
      
      // Fix missing name field for existing users
      if (!regularUser.name && (googleUser.name || lmsUser.name)) {
        regularUser.name = googleUser.name || lmsUser.name
        console.log('🔧 Fixed missing name for existing user')
      }
    }

    // Update login streak
    let streakInfo = null
    let loginStreak = 0
    
    streakInfo = regularUser.updateLoginStreak()
    await regularUser.save()
    loginStreak = regularUser.loginStreak
    console.log('✅ Login streak updated:', streakInfo)

    // Generate JWT token
    const jwtToken = generateToken(lmsUser._id)

    res.json({
      token: jwtToken,
      user: {
        _id: lmsUser._id,
        name: lmsUser.name,
        email: lmsUser.email,
        role: lmsUser.role,
        points: lmsUser.points,
        photoURL: lmsUser.photoURL,
        loginStreak,
        streakInfo
      }
    })
  } catch (error) {
    console.error('❌ Google login error:', error)
    res.status(500).json({ error: error.message || 'Google authentication failed' })
  }
})

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production')
    const user = await LMSUser.findById(decoded.userId)
      .populate('classesJoined', 'className joinCode')
      .populate('classesCreated', 'className joinCode students')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      photoURL: user.photoURL,
      classesJoined: user.classesJoined,
      classesCreated: user.classesCreated
    })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

// DEV ONLY: Get all users for switcher
router.get('/users', async (req, res) => {
  try {
    const lmsUsers = await LMSUser.find()
      .select('name email role points photoURL')
      .sort({ createdAt: -1 })
    
    // Enrich with regular User data
    const enrichedUsers = await Promise.all(
      lmsUsers.map(async (lmsUser) => {
        const regularUser = await User.findOne({ email: lmsUser.email })
        return {
          _id: lmsUser._id,
          name: lmsUser.name,
          email: lmsUser.email,
          role: lmsUser.role,
          points: lmsUser.points,
          xp: regularUser?.xp || 0,
          level: regularUser?.level || 1,
          coins: regularUser?.coins || 0,
          loginStreak: regularUser?.loginStreak || 0
        }
      })
    )

    res.json({ users: enrichedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: error.message })
  }
})

// DEV ONLY: Impersonate any user (generates valid JWT)
// WARNING: Remove or protect this in production!
router.post('/dev-impersonate', async (req, res) => {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    // Find user in LMSUser collection
    const lmsUser = await LMSUser.findById(userId)
    
    if (!lmsUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Also fetch regular User for complete data
    const regularUser = await User.findOne({ email: lmsUser.email })

    // Generate token
    const token = generateToken(lmsUser._id)

    // Return complete user data
    const userData = {
      _id: lmsUser._id,
      name: lmsUser.name,
      email: lmsUser.email,
      role: lmsUser.role,
      points: lmsUser.points,
      photoURL: lmsUser.photoURL,
      xp: regularUser?.xp || 0,
      level: regularUser?.level || 1,
      coins: regularUser?.coins || 0,
      loginStreak: regularUser?.loginStreak || 0,
      progress: regularUser?.progress || {}
    }

    console.log('🔧 DEV: Impersonating user:', lmsUser.email)

    res.json({
      token,
      user: userData
    })
  } catch (error) {
    console.error('❌ Dev impersonate error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
