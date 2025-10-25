import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from "node-fetch";

// Load environment variables FIRST before importing anything else
dotenv.config()

import connectDB from './config/db.js'

// Import routes AFTER dotenv is configured
import userRoutes from './routes/userRoutes.js'
import learningPathRoutes from './routes/learningPathRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import rewardRoutes from './routes/rewardRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import socialRoutes from './routes/socialRoutes.js'

// Initialize express app
const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/users', userRoutes)
app.use('/api/learning-path', learningPathRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/rewards', rewardRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/social', socialRoutes)

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

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
