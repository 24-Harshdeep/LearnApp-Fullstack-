import mongoose from 'mongoose'

const codeChainSchema = new mongoose.Schema({
  title: String,
  challenge: {
    type: String,
    required: true
  },
  description: String,
  topic: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  maxPlayers: {
    type: Number,
    default: 5,
    min: 2,
    max: 10
  },
  currentPlayers: {
    type: Number,
    default: 0
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    lineNumber: Number,
    code: String,
    submittedAt: Date
  }],
  codeLines: [String], // Accumulated code line by line
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'evaluated'],
    default: 'waiting'
  },
  aiEvaluation: {
    score: Number,
    feedback: String,
    passed: Boolean,
    evaluatedAt: Date
  },
  rewards: {
    perPlayer: {
      coins: Number,
      xp: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  }
})

const CodeChain = mongoose.models.CodeChain || mongoose.model('CodeChain', codeChainSchema)

export default CodeChain
