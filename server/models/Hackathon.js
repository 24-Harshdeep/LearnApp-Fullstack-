import mongoose from 'mongoose'

const hackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  challenge: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  topic: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming'
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  rewards: {
    firstPlace: { coins: Number, xp: Number, badge: String },
    secondPlace: { coins: Number, xp: Number },
    thirdPlace: { coins: Number, xp: Number },
    participation: { coins: Number, xp: Number }
  },
  leaderboard: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    score: Number,
    completionTime: Number, // in seconds
    submittedAt: Date,
    code: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Check if model exists before creating
const Hackathon = mongoose.models.Hackathon || mongoose.model('Hackathon', hackathonSchema)

export default Hackathon
