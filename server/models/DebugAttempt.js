import mongoose from 'mongoose'

const DebugAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  userEmail: { type: String, required: false },
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  title: { type: String },
  buggyCode: { type: String },
  solution: { type: String },
  solved: { type: Boolean, default: false },
  timeTaken: { type: Number }, // seconds
  hintsUsed: { type: Number, default: 0 },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now }
})

const DebugAttempt = mongoose.model('DebugAttempt', DebugAttemptSchema)

export default DebugAttempt
