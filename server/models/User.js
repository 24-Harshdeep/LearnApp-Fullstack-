import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  coins: {
    type: Number,
    default: 0
  },
  gamePoints: {
    type: Number,
    default: 0
  },
  streak: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: Date.now }
  },
  preferences: {
    theme: { type: String, default: 'light' },
    notifications: { type: Boolean, default: true },
    learningGoal: { type: String, default: 'full-stack' }
  },
  badges: [{
    badgeId: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  unlockedRewards: [String],
  lastSpinDate: Date,
  dailyTasksCompleted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Calculate level from XP
userSchema.methods.calculateLevel = function() {
  this.level = Math.floor(this.xp / 200) + 1
}

const User = mongoose.model('User', userSchema)

export default User
