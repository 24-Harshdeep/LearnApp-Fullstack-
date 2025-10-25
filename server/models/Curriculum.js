import mongoose from 'mongoose'

const practicalTaskSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  hints: [String],
  xpReward: {
    type: Number,
    default: 20
  }
})

const subtopicSchema = new mongoose.Schema({
  lessonTitle: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  codeExamples: [String],
  practicalTasks: [practicalTaskSchema],
  bonusTips: String,
  resources: [String],
  order: {
    type: Number,
    required: true
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  }
})

const curriculumSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  subtopics: [subtopicSchema],
  totalXP: {
    type: Number,
    default: 0
  },
  prerequisites: [String],
  tags: [String],
  icon: {
    type: String,
    default: '📚'
  },
  estimatedHours: {
    type: Number,
    default: 5
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Calculate total XP before saving
curriculumSchema.pre('save', function(next) {
  let totalXP = 0
  this.subtopics.forEach(subtopic => {
    subtopic.practicalTasks.forEach(task => {
      totalXP += task.xpReward || 20
    })
  })
  this.totalXP = totalXP
  next()
})

const Curriculum = mongoose.model('Curriculum', curriculumSchema)

export default Curriculum
