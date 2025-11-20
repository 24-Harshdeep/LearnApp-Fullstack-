import mongoose from 'mongoose'

const hackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  problemStatement: {
    type: String,
    required: true
  },
  challenge: {
    type: String,
    required: true
  },
  // Google Classroom-style additional info
  detailedInstructions: {
    type: String,
    default: ''
  },
  tasks: [{
    taskTitle: String,
    taskDescription: String,
    points: { type: Number, default: 0 },
    isRequired: { type: Boolean, default: true }
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String, // 'pdf', 'doc', 'image', 'video', 'link'
    uploadedAt: { type: Date, default: Date.now }
  }],
  resources: [{
    title: String,
    url: String,
    description: String
  }],
  submissionRequirements: {
    type: String,
    default: ''
  },
  allowedFileTypes: [String], // e.g., ['pdf', 'zip', 'jpg', 'png']
  minTeamSize: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  topic: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSClass'
  },
  teams: [{
    teamName: {
      type: String,
      required: true
    },
    problemStatement: String,
    members: [String], // Member names
    memberIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    memberEmails: [String], // For team member identification
    teamLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    teamLeaderEmail: String,
    submissionLink: String,
    submissionFile: String,
    submittedFiles: [{
      fileName: String,
      fileUrl: String,
      fileType: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: { type: Date, default: Date.now }
    }],
    submissionText: String, // Text description of submission
    progressUpdates: [{
      message: String,
      timestamp: { type: Date, default: Date.now },
      postedBy: String
    }],
    score: Number,
    feedback: String, // Teacher feedback
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: Date,
    submittedAt: Date,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'submitted', 'graded'],
      default: 'not_started'
    }
  }],
  polls: [{
    question: {
      type: String,
      required: true
    },
    options: [String],
    votes: [{
      option: String,
      votedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  maxTeamSize: {
    type: Number,
    default: 4
  },
  acceptingSubmissions: {
    type: Boolean,
    default: true
  },
  rewards: {
    firstPlace: { coins: Number, xp: Number, badge: String },
    secondPlace: { coins: Number, xp: Number },
    thirdPlace: { coins: Number, xp: Number },
    participation: { coins: Number, xp: Number }
  },
  prizes: [{
    position: String,
    description: String,
    xpReward: Number
  }],
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
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Check if model exists before creating
const Hackathon = mongoose.models.Hackathon || mongoose.model('Hackathon', hackathonSchema)

export default Hackathon
