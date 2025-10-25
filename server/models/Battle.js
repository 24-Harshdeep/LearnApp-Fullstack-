import mongoose from 'mongoose'

const battleSchema = new mongoose.Schema({
  player1: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: String,
    score: { type: Number, default: 0 },
    answers: [{
      questionId: String,
      answer: String,
      correct: Boolean,
      timeSpent: Number
    }],
    ready: { type: Boolean, default: false }
  },
  player2: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    score: { type: Number, default: 0 },
    answers: [{
      questionId: String,
      answer: String,
      correct: Boolean,
      timeSpent: Number
    }],
    ready: { type: Boolean, default: false }
  },
  questions: [{
    id: String,
    question: String,
    options: [String],
    correctAnswer: String,
    topic: String,
    difficulty: String
  }],
  topic: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['waiting', 'ready', 'in-progress', 'completed'],
    default: 'waiting'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startedAt: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  }
})

const Battle = mongoose.models.Battle || mongoose.model('Battle', battleSchema)

export default Battle
