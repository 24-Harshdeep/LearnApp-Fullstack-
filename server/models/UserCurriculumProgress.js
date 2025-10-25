import mongoose from 'mongoose'

const lessonProgressSchema = new mongoose.Schema({
  subtopicId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  lessonTitle: String,
  completed: {
    type: Boolean,
    default: false
  },
  completedTasks: [{
    taskIndex: Number,
    submittedCode: String,
    passed: Boolean,
    completedAt: Date
  }],
  startedAt: Date,
  completedAt: Date,
  timeSpent: {
    type: Number, // in minutes
    default: 0
  }
})

const userCurriculumProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  curriculumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curriculum',
    required: true
  },
  topic: String,
  currentSubtopicIndex: {
    type: Number,
    default: 0
  },
  lessonsProgress: [lessonProgressSchema],
  totalProgress: {
    type: Number, // percentage 0-100
    default: 0
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Calculate total progress
userCurriculumProgressSchema.methods.calculateProgress = function() {
  if (this.lessonsProgress.length === 0) {
    this.totalProgress = 0
    return
  }
  
  const completedLessons = this.lessonsProgress.filter(l => l.completed).length
  this.totalProgress = Math.round((completedLessons / this.lessonsProgress.length) * 100)
  
  if (this.totalProgress === 100 && !this.isCompleted) {
    this.isCompleted = true
    this.completedAt = new Date()
  }
}

const UserCurriculumProgress = mongoose.model('UserCurriculumProgress', userCurriculumProgressSchema)

export default UserCurriculumProgress
