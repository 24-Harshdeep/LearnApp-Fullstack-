import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  xpReward: {
    type: Number,
    required: true
  },
  timeEstimate: String, // e.g., "45 min"
  instructions: String,
  starterCode: String,
  solution: String,
  hints: [String],
  testCases: [{
    input: String,
    expectedOutput: String
  }],
  tags: [String],
  aiGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

export default Task
