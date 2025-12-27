import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from "node-fetch";
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables FIRST before importing anything else
dotenv.config({ path: join(__dirname, '.env') })

import connectDB from './config/db.js'

// Import routes AFTER dotenv is configured
import userRoutes from './routes/userRoutes.js'
import learningPathRoutes from './routes/learningPathRoutes.js'
import curriculumRoutes from './routes/curriculumRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import rewardRoutes from './routes/rewardRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import socialRoutes from './routes/socialRoutes.js'
import unifiedAIRoutes from './routes/unifiedAIRoutes.js'
import aiBattleRoutes from './routes/aiBattleRoutes.js'
// LMS routes
import lmsAuthRoutes from './routes/lmsAuthRoutes.js'
import lmsClassRoutes from './routes/lmsClassRoutes.js'
import lmsAssignmentRoutes from './routes/lmsAssignmentRoutes.js'
import lmsSubmissionRoutes from './routes/lmsSubmissionRoutes.js'
// Teacher, Hackathon, and Notification routes
import teacherRoutes from './routes/teacherRoutes.js'
import hackathonRoutes from './routes/hackathonRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import { initializeFirebaseAdmin } from './config/firebase.js'
import geminiAI from './services/geminiAIService.js'

// Initialize express app
const app = express()

// Connect to MongoDB
connectDB()

// Initialize Firebase Admin (optional for development)
initializeFirebaseAdmin()

// Initialize Gemini AI Service
const aiInitialized = geminiAI.initialize()
if (aiInitialized) {
  console.log('✅ Gemini AI Service initialized successfully')
} else {
  console.warn('⚠️  Gemini AI Service initialization failed - check API key')
}

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL,
        /\.vercel\.app$/,  // Allow all Vercel preview deployments
        /\.onrender\.com$/  // Allow Render deployments
      ]
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files with absolute path
app.use('/uploads', express.static(join(__dirname, 'uploads')))

// Routes
app.use('/api/users', userRoutes)
app.use('/api/learning-path', learningPathRoutes)
app.use('/api/curriculum', curriculumRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/rewards', rewardRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/unified-ai', unifiedAIRoutes)
app.use('/api/social', socialRoutes)
app.use('/api/ai-battle', aiBattleRoutes)
// LMS routes
app.use('/api/lms/auth', lmsAuthRoutes)
app.use('/api/lms/classes', lmsClassRoutes)
app.use('/api/lms/assignments', lmsAssignmentRoutes)
app.use('/api/lms/submissions', lmsSubmissionRoutes)
// Teacher, Hackathon, and Notification routes
app.use('/api/teacher', teacherRoutes)
app.use('/api/hackathons', hackathonRoutes)
app.use('/api/notifications', notificationRoutes)

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  })
})

// Start server with Socket.IO
const PORT = process.env.PORT || 5000
const httpServer = http.createServer(app)

// Initialize Socket.IO
import { initSocket } from './socket.js'
initSocket(httpServer)

// Only start server if not in serverless environment (Vercel)
if (process.env.VERCEL !== '1') {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

// Export for Vercel serverless
export default app
