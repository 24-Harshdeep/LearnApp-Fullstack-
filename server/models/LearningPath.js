import mongoose from 'mongoose'

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  topics: [String],
  order: Number,
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: String, // e.g., "2 weeks"
  xpReward: Number, // XP earned on completion
  prerequisites: [String], // Module IDs
  resources: [{
    title: String,
    type: { type: String, enum: ['video', 'article', 'documentation', 'exercise'] },
    url: String
  }],
  // Curriculum-specific fields for structured learning
  subtopics: [{
    lesson_title: String,
    explanation: String,
    code_examples: [String],
    practical_tasks: [{
      task: String,
      expected_output: String
    }],
    bonus_tips: String,
    resources: [String]
  }]
}, {
  timestamps: true
})

const LearningPath = mongoose.model('LearningPath', moduleSchema)

export default LearningPath
