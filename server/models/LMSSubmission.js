import mongoose from 'mongoose'

const lmsSubmissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSUser',
    required: true
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSAssignment',
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
  feedback: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'completed'],
    default: 'pending'
  }
})

export default mongoose.model('LMSSubmission', lmsSubmissionSchema)
