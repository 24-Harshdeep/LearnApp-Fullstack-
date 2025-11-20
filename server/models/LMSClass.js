import mongoose from 'mongoose'

const lmsClassSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSUser',
    required: true
  },
  className: {
    type: String,
    required: true
  },
  description: String,
  joinCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSUser'
  }],
  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSAssignment'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Generate random 6-character alphanumeric code
lmsClassSchema.statics.generateJoinCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default mongoose.model('LMSClass', lmsClassSchema)
