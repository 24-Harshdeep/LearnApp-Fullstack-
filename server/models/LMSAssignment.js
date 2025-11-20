import mongoose from 'mongoose'

const lmsAssignmentSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSClass',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  attachmentLink: {
    type: String,
    default: ''
  },
  attachmentFile: {
    type: String,
    default: ''
  },
  dueDate: {
    type: Date,
    required: true
  },
  maxPoints: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSSubmission'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('LMSAssignment', lmsAssignmentSchema)
