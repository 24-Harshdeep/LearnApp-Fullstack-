import mongoose from 'mongoose'

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath'
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedAt: Date,
  timeSpent: Number, // in minutes
  attemptsCount: {
    type: Number,
    default: 0
  },
  accuracyScore: Number, // percentage
  notes: String
}, {
  timestamps: true
})

// Compound index for efficient queries
userProgressSchema.index({ userId: 1, moduleId: 1 })
userProgressSchema.index({ userId: 1, taskId: 1 })

const UserProgress = mongoose.model('UserProgress', userProgressSchema)

export default UserProgress
