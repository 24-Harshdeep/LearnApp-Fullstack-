import mongoose from 'mongoose'

const lmsUserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  },
  classesJoined: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSClass'
  }],
  classesCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSClass'
  }],
  points: {
    type: Number,
    default: 0
  },
  photoURL: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('LMSUser', lmsUserSchema)
