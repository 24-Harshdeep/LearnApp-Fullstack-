import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'hackathon', 'deadline', 'achievement', 'announcement'],
    default: 'info'
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  senderName: String,
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receivers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: Date
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  link: String,
  icon: String,
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSClass'
  },
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon'
  },
  broadcast: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes for faster queries
notificationSchema.index({ receiverId: 1, read: 1, createdAt: -1 })
notificationSchema.index({ senderId: 1 })
notificationSchema.index({ classId: 1 })
notificationSchema.index({ broadcast: 1, createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
