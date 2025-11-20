import express from 'express'
import jwt from 'jsonwebtoken'
import LMSUser from '../models/LMSUser.js'
import { generateToken } from '../middleware/lmsAuth.js'
import { verifyFirebaseToken } from '../config/firebase.js'

const router = express.Router()

// Register/Login with Firebase token
router.post('/login', async (req, res) => {
  try {
    const { idToken, name, email, photoURL, role } = req.body

    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required' })
    }

    // For development without Firebase Admin SDK
    let firebaseUid = email.replace('@', '_').replace('.', '_')

    // Try to verify Firebase token if available
    if (idToken) {
      try {
        const decodedToken = await verifyFirebaseToken(idToken)
        if (decodedToken) {
          firebaseUid = decodedToken.uid
        }
      } catch (error) {
        console.log('Firebase verification skipped:', error.message)
      }
    }

    // Check if user exists
    let user = await LMSUser.findOne({ email })

    if (user) {
      // User exists - return user data and token
      const token = generateToken(user._id)
      return res.json({
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

    // New user - check if role is provided
    if (!role || !['teacher', 'student'].includes(role)) {
      return res.status(400).json({ 
        needsRole: true,
        message: 'Please select your role'
      })
    }

    // Create new user
    user = new LMSUser({
      firebaseUid,
      name,
      email,
      role,
      photoURL
    })

    await user.save()

    const token = generateToken(user._id)

    res.status(201).json({
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
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: error.message })
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

export default router
