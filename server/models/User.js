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
    required: false  // Not required for Google auth users
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    default: 'student'
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
  progress: {
    html: { type: Number, default: 0, min: 0, max: 100 },
    css: { type: Number, default: 0, min: 0, max: 100 },
    javascript: { type: Number, default: 0, min: 0, max: 100 },
    react: { type: Number, default: 0, min: 0, max: 100 },
    nodejs: { type: Number, default: 0, min: 0, max: 100 },
    typescript: { type: Number, default: 0, min: 0, max: 100 }
  },
  confidenceIndex: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  rewardsUnlocked: [{
    type: String
  }],
  preferences: {
    theme: { type: String, default: 'light' },
    selectedTheme: { type: String, default: 'light' },
    themesUnlocked: [{ type: String }],
    notifications: { type: Boolean, default: true },
    learningGoal: { type: String, default: 'full-stack' }
  },
  badges: [{
    badgeId: String,
    name: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  rewardsUnlocked: [{
    type: String
  }],
  unlockedRewards: [String],
  lastSpinDate: Date,
  dailyTasksCompleted: {
    type: Number,
    default: 0
  },
  weeklyGoalProgress: {
    type: Number,
    default: 0
  },
  // Track completed task IDs for this user
  completedTasks: [{
    type: String
  }],
  lastActive: {
    type: Date,
    default: Date.now
  },
  loginStreak: {
    type: Number,
    default: 0
  },
  lastLoginDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Calculate level from XP
userSchema.methods.calculateLevel = function() {
  this.level = Math.floor(this.xp / 200) + 1
}

// Update login streak
userSchema.methods.updateLoginStreak = function() {
  const now = new Date()
  // Use both calendar-day and 24-hour sliding window logic to be more forgiving
  if (!this.lastLoginDate) {
    // First login ever
    this.loginStreak = 1
    this.lastLoginDate = now
    return { isNewStreak: true, streak: 1 }
  }

  const lastLogin = new Date(this.lastLoginDate)
  const diffMs = now - lastLogin
  const diffDays = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate())) / (1000 * 60 * 60 * 24))

  // If already logged in today (same calendar day)
  if (diffDays === 0) {
    return { isNewStreak: false, streak: this.loginStreak }
  }

  // If last login was within the last 24 hours (sliding window), treat as consecutive
  const ONE_DAY_MS = 24 * 60 * 60 * 1000
  if (diffMs > 0 && diffMs <= ONE_DAY_MS) {
    this.loginStreak += 1
    this.lastLoginDate = now
    return { isNewStreak: true, streak: this.loginStreak }
  }

  // If it's the next calendar day, also treat as consecutive
  if (diffDays === 1) {
    this.loginStreak += 1
    this.lastLoginDate = now
    return { isNewStreak: true, streak: this.loginStreak }
  }

  // Otherwise streak broken - reset to 1
  this.loginStreak = 1
  this.lastLoginDate = now
  return { isNewStreak: true, streak: 1, streakBroken: true }
}

const User = mongoose.model('User', userSchema)

export default User
