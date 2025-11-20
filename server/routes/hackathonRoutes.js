import express from 'express'
import multer from 'multer'
import path from 'path'
import { protect } from '../middleware/lmsAuth.js'
import { optionalAuth } from '../middleware/optionalAuth.js'
import Hackathon from '../models/Hackathon.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/hackathons/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|zip|txt|ppt|pptx/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, documents, and archives are allowed.'))
    }
  }
})

// Middleware to check if user is a teacher
const isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teachers only.' })
  }
  next()
}

// Get all hackathons
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, classId } = req.query
    const query = {}
    
    if (status) query.status = status
    if (classId) query.classId = classId

    const hackathons = await Hackathon.find(query)
      .populate('createdBy', 'name email')
      .populate('classId', 'name subject')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      hackathons,
      total: hackathons.length
    })
  } catch (error) {
    console.error('Error fetching hackathons:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch hackathons',
      error: error.message 
    })
  }
})

// Get single hackathon
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('classId', 'name subject')
      .populate('teams.memberIds', 'name email')
      .populate('participants', 'name email')

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    res.json({
      success: true,
      hackathon
    })
  } catch (error) {
    console.error('Error fetching hackathon:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch hackathon',
      error: error.message 
    })
  }
})

// Create hackathon (teachers only)
router.post('/create', protect, isTeacher, upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      problemStatement,
      challenge,
      detailedInstructions,
      tasks,
      resources,
      submissionRequirements,
      allowedFileTypes,
      difficulty,
      topic,
      startDate,
      endDate,
      deadline,
      classId,
      maxParticipants,
      maxTeamSize,
      minTeamSize,
      prizes
    } = req.body

    if (!title || !problemStatement || !challenge || !deadline) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, problem statement, challenge, and deadline are required' 
      })
    }

    // Process uploaded files
    const attachments = req.files ? req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: `/uploads/hackathons/${file.filename}`,
      fileType: path.extname(file.originalname).substring(1)
    })) : []

    // Parse JSON fields if they come as strings
    const parsedTasks = tasks ? (typeof tasks === 'string' ? JSON.parse(tasks) : tasks) : []
    const parsedResources = resources ? (typeof resources === 'string' ? JSON.parse(resources) : resources) : []
    const parsedAllowedFileTypes = allowedFileTypes ? (typeof allowedFileTypes === 'string' ? JSON.parse(allowedFileTypes) : allowedFileTypes) : []

    const hackathon = new Hackathon({
      title,
      description,
      problemStatement,
      challenge,
      detailedInstructions,
      tasks: parsedTasks,
      attachments,
      resources: parsedResources,
      submissionRequirements,
      allowedFileTypes: parsedAllowedFileTypes,
      difficulty,
      topic,
      createdBy: req.user._id,
      classId,
      startDate: startDate || new Date(),
      endDate: endDate || deadline,
      deadline,
      maxParticipants,
      maxTeamSize,
      minTeamSize,
      prizes,
      status: new Date() >= new Date(startDate || Date.now()) ? 'active' : 'upcoming'
    })

    await hackathon.save()

    const populatedHackathon = await Hackathon.findById(hackathon._id)
      .populate('createdBy', 'name email')
      .populate('classId', 'name subject')

    res.status(201).json({
      success: true,
      message: 'Hackathon created successfully',
      hackathon: populatedHackathon
    })
  } catch (error) {
    console.error('Error creating hackathon:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create hackathon',
      error: error.message 
    })
  }
})

// Join hackathon
router.post('/:id/join', protect, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    // Check if already joined
    if (hackathon.participants.includes(req.user._id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already joined this hackathon' 
      })
    }

    // Check max participants
    if (hackathon.participants.length >= hackathon.maxParticipants) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hackathon is full' 
      })
    }

    hackathon.participants.push(req.user._id)
    await hackathon.save()

    res.json({
      success: true,
      message: 'Joined hackathon successfully',
      hackathon
    })
  } catch (error) {
    console.error('Error joining hackathon:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to join hackathon',
      error: error.message 
    })
  }
})

// Create/Join a team
router.post('/:id/team', protect, async (req, res) => {
  try {
    console.log('📝 Team creation request:', {
      hackathonId: req.params.id,
      userId: req.user._id,
      userEmail: req.user.email,
      teamData: req.body
    })
    
    const { teamName, problemStatement, members, memberEmails } = req.body
    const hackathon = await Hackathon.findById(req.params.id)

    if (!hackathon) {
      console.log('❌ Hackathon not found:', req.params.id)
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    // Check if user already in a team
    const existingTeam = hackathon.teams.find(team => 
      team.memberIds.some(id => id.toString() === req.user._id.toString())
    )

    if (existingTeam) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already in a team for this hackathon' 
      })
    }

    // Validate team size
    const memberCount = members ? members.length : 1
    if (memberCount < hackathon.minTeamSize) {
      return res.status(400).json({ 
        success: false, 
        message: `Team must have at least ${hackathon.minTeamSize} members` 
      })
    }
    
    if (memberCount > hackathon.maxTeamSize) {
      return res.status(400).json({ 
        success: false, 
        message: `Team size exceeds maximum of ${hackathon.maxTeamSize}` 
      })
    }

    const team = {
      teamName,
      problemStatement,
      members: members || [req.user.name],
      memberIds: [req.user._id],
      memberEmails: memberEmails || [req.user.email],
      teamLeader: req.user._id,
      teamLeaderEmail: req.user.email,
      progressUpdates: [],
      status: 'not_started'
    }

    hackathon.teams.push(team)
    
    // Add to participants if not already
    if (!hackathon.participants.includes(req.user._id)) {
      hackathon.participants.push(req.user._id)
    }

    await hackathon.save()

    res.json({
      success: true,
      message: 'Team created successfully',
      team,
      hackathon
    })
  } catch (error) {
    console.error('Error creating team:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create team',
      error: error.message 
    })
  }
})

// Add member to team
router.post('/:id/team/:teamId/add-member', protect, async (req, res) => {
  try {
    const { memberName, memberEmail } = req.body
    const hackathon = await Hackathon.findById(req.params.id)

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    const team = hackathon.teams.id(req.params.teamId)

    if (!team) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      })
    }

    // Check if user is a team member (allow members to manage team)
    const isMember = (team.memberIds && team.memberIds.some(id => {
      try {
        const idStr = id && (id._id ? id._id.toString() : id.toString())
        return idStr === req.user._id.toString()
      } catch (e) { return false }
    })) || (team.memberEmails && team.memberEmails.some(e => e && e.toLowerCase() === req.user.email.toLowerCase()))
    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only team members can modify this team' 
      })
    }

    // Check team size
    if (team.members.length >= hackathon.maxTeamSize) {
      return res.status(400).json({ 
        success: false, 
        message: `Team is full (maximum ${hackathon.maxTeamSize} members)` 
      })
    }

    // Check if member already in team
    if (team.memberEmails.includes(memberEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Member already in team' 
      })
    }

    team.members.push(memberName)
    team.memberEmails.push(memberEmail)

    await hackathon.save()

    res.json({
      success: true,
      message: 'Member added successfully',
      team
    })
  } catch (error) {
    console.error('Error adding member:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add member',
      error: error.message 
    })
  }
})

// Update team (Edit)
router.patch('/:id/team/:teamId', protect, async (req, res) => {
  try {
    const { teamName, problemStatement, members, memberEmails } = req.body
    const hackathon = await Hackathon.findById(req.params.id)

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    const team = hackathon.teams.id(req.params.teamId)

    if (!team) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      })
    }

    // Check if user is a team member (allow members to edit team details)
    const isMember = (team.memberIds && team.memberIds.some(id => {
      try {
        const idStr = id && (id._id ? id._id.toString() : id.toString())
        return idStr === req.user._id.toString()
      } catch (e) { return false }
    })) || (team.memberEmails && team.memberEmails.some(e => e && e.toLowerCase() === req.user.email.toLowerCase()))
    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only team members can edit team' 
      })
    }

    // Update fields if provided
    if (teamName) team.teamName = teamName
    if (problemStatement) team.problemStatement = problemStatement
    if (members) team.members = members
    if (memberEmails) team.memberEmails = memberEmails

    await hackathon.save()

    res.json({
      success: true,
      message: 'Team updated successfully',
      team
    })
  } catch (error) {
    console.error('Error updating team:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update team',
      error: error.message 
    })
  }
})

// Delete team
router.delete('/:id/team/:teamId', protect, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    const team = hackathon.teams.id(req.params.teamId)

    if (!team) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      })
    }

    // Check if user is a team member (allow members to delete their own team)
    const isMember = (team.memberIds && team.memberIds.some(id => {
      try {
        const idStr = id && (id._id ? id._id.toString() : id.toString())
        return idStr === req.user._id.toString()
      } catch (e) { return false }
    })) || (team.memberEmails && team.memberEmails.some(e => e && e.toLowerCase() === req.user.email.toLowerCase()))
    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only team members can delete this team' 
      })
    }

    // Remove team
    team.deleteOne()
    
    // Remove members from participants if they're not in other teams
    for (const memberId of team.memberIds) {
      const isInOtherTeam = hackathon.teams.some(t => 
        t._id.toString() !== team._id.toString() && 
        t.memberIds.some(id => id.toString() === memberId.toString())
      )
      if (!isInOtherTeam) {
        hackathon.participants = hackathon.participants.filter(
          id => id.toString() !== memberId.toString()
        )
      }
    }

    await hackathon.save()

    res.json({
      success: true,
      message: 'Team deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting team:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete team',
      error: error.message 
    })
  }
})

// Submit for a team
router.post('/:id/team/:teamId/submit', protect, upload.array('submissionFiles', 5), async (req, res) => {
  try {
    const { submissionLink, submissionText } = req.body
    const hackathon = await Hackathon.findById(req.params.id)

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    if (!hackathon.acceptingSubmissions) {
      return res.status(400).json({ 
        success: false, 
        message: 'Submissions are closed for this hackathon' 
      })
    }

    const team = hackathon.teams.id(req.params.teamId)

    if (!team) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      })
    }

    // Check if user is in the team (robust to populated objects or raw ids)
    const isTeamMember = (team.memberIds || []).some(member => {
      try {
        if (!member) return false
        // member may be an ObjectId, a populated user object with _id, or a string
        const memberIdStr = member._id ? member._id.toString() : member.toString()
        return memberIdStr === req.user._id.toString()
      } catch (e) {
        return false
      }
    })

    if (!isTeamMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not a member of this team' 
      })
    }

    // Process uploaded files
    const submittedFiles = req.files ? req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: `/uploads/hackathons/${file.filename}`,
      fileType: path.extname(file.originalname).substring(1),
      uploadedBy: req.user._id
    })) : []

    team.submissionLink = submissionLink
    team.submissionText = submissionText
    team.submittedFiles = [...(team.submittedFiles || []), ...submittedFiles]
    team.submittedAt = new Date()
    team.status = 'submitted'

    await hackathon.save()

    res.json({
      success: true,
      message: 'Submission recorded successfully',
      team
    })
  } catch (error) {
    console.error('Error submitting:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit',
      error: error.message 
    })
  }
})

// Edit a team's submission (teachers or team members)
router.patch('/:id/team/:teamId/submission', protect, upload.array('submissionFiles', 5), async (req, res) => {
  try {
    const { submissionLink, submissionText, removeFileUrls } = req.body
    const hackathon = await Hackathon.findById(req.params.id)

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      })
    }

    const team = hackathon.teams.id(req.params.teamId)

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      })
    }

    // Authorization: allow teachers OR team members to update submission
    const isTeamMember = (team.memberIds || []).some(member => {
      try {
        if (!member) return false
        const memberIdStr = member._id ? member._id.toString() : member.toString()
        return memberIdStr === req.user._id.toString()
      } catch (e) { return false }
    }) || (team.memberEmails && req.user.email && team.memberEmails.some(e => e && e.toLowerCase() === req.user.email.toLowerCase()))

    const isTeacherUser = (req.user && req.user.role === 'teacher')

    if (!isTeacherUser && !isTeamMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this submission' })
    }

    // Allow both teachers and members to modify submission text/link and append files.
    // Only teachers are allowed to remove existing files via removeFileUrls.
    if (submissionText !== undefined) team.submissionText = submissionText
    if (submissionLink !== undefined) team.submissionLink = submissionLink

    // Remove files only if teacher requested it
    let removeList = []
    if (removeFileUrls && isTeacherUser) {
      try {
        removeList = typeof removeFileUrls === 'string' ? JSON.parse(removeFileUrls) : removeFileUrls
      } catch (e) {
        removeList = (removeFileUrls || '').split(',').map(s => s.trim()).filter(Boolean)
      }

      if (removeList && removeList.length && team.submittedFiles) {
        team.submittedFiles = team.submittedFiles.filter(f => !removeList.includes(f.fileUrl))
      }
    }

    // Append newly uploaded files (both teachers and members can add files)
    const newFiles = req.files ? req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: `/uploads/hackathons/${file.filename}`,
      fileType: path.extname(file.originalname).substring(1),
      uploadedBy: req.user._id
    })) : []

    if (newFiles.length) {
      team.submittedFiles = [...(team.submittedFiles || []), ...newFiles]
      team.submittedAt = new Date()
      team.status = 'submitted'
    }

    // If updated text/link without adding files, update submittedAt/status
    if ((submissionText !== undefined || submissionLink !== undefined) && !newFiles.length) {
      team.submittedAt = new Date()
      team.status = team.status === 'graded' ? team.status : 'submitted'
    }

    await hackathon.save()

    res.json({
      success: true,
      message: 'Submission updated successfully',
      team
    })
  } catch (error) {
    console.error('Error editing submission:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to edit submission',
      error: error.message
    })
  }
})

// Post progress update
router.post('/:id/team/:teamId/progress', protect, async (req, res) => {
  try {
    const { message } = req.body
    const hackathon = await Hackathon.findById(req.params.id)

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    const team = hackathon.teams.id(req.params.teamId)

    if (!team) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      })
    }

    // Check if user is in the team
    if (!team.memberIds.some(id => id.toString() === req.user._id.toString())) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not a member of this team' 
      })
    }

    team.progressUpdates.push({
      message,
      postedBy: req.user.name,
      timestamp: new Date()
    })

    await hackathon.save()

    res.json({
      success: true,
      message: 'Progress update posted',
      update: team.progressUpdates[team.progressUpdates.length - 1]
    })
  } catch (error) {
    console.error('Error posting progress:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to post progress',
      error: error.message 
    })
  }
})

// Create poll (teachers only)
router.post('/:id/poll', protect, isTeacher, async (req, res) => {
  try {
    const { question, options } = req.body
    const hackathon = await Hackathon.findById(req.params.id)

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    if (!question || !options || options.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Question and at least 2 options required' 
      })
    }

    const poll = {
      question,
      options,
      votes: []
    }

    hackathon.polls.push(poll)
    await hackathon.save()

    res.json({
      success: true,
      message: 'Poll created successfully',
      poll
    })
  } catch (error) {
    console.error('Error creating poll:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create poll',
      error: error.message 
    })
  }
})

// Vote on poll
router.post('/:id/poll/:pollId/vote', protect, async (req, res) => {
  try {
    const { option } = req.body
    const hackathon = await Hackathon.findById(req.params.id)

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    const poll = hackathon.polls.id(req.params.pollId)

    if (!poll) {
      return res.status(404).json({ 
        success: false, 
        message: 'Poll not found' 
      })
    }

    // Check if already voted
    const existingVote = poll.votes.find(v => v.votedBy.toString() === req.user._id.toString())

    if (existingVote) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already voted on this poll' 
      })
    }

    poll.votes.push({
      option,
      votedBy: req.user._id
    })

    await hackathon.save()

    res.json({
      success: true,
      message: 'Vote recorded',
      poll
    })
  } catch (error) {
    console.error('Error voting:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to vote',
      error: error.message 
    })
  }
})

// Get submissions (teachers only)
router.get('/:id/submissions', protect, isTeacher, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('teams.memberIds', 'name email')

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    const submissions = hackathon.teams.filter(team => team.submittedAt)

    res.json({
      success: true,
      submissions,
      total: submissions.length
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch submissions',
      error: error.message 
    })
  }
})

// Toggle accepting submissions (teachers only)
router.patch('/:id/toggle-submissions', protect, isTeacher, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    hackathon.acceptingSubmissions = !hackathon.acceptingSubmissions
    await hackathon.save()

    res.json({
      success: true,
      message: `Submissions ${hackathon.acceptingSubmissions ? 'enabled' : 'disabled'}`,
      acceptingSubmissions: hackathon.acceptingSubmissions
    })
  } catch (error) {
    console.error('Error toggling submissions:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle submissions',
      error: error.message 
    })
  }
})

// Grade team submission (teachers only)
router.post('/:id/team/:teamId/grade', protect, isTeacher, async (req, res) => {
  try {
    const { score, feedback } = req.body
    const hackathon = await Hackathon.findById(req.params.id)

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    const team = hackathon.teams.id(req.params.teamId)

    if (!team) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      })
    }

    team.score = score
    team.feedback = feedback
    team.gradedBy = req.user._id
    team.gradedAt = new Date()
    team.status = 'graded'

    await hackathon.save()

    res.json({
      success: true,
      message: 'Team graded successfully',
      team
    })
  } catch (error) {
    console.error('Error grading team:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to grade team',
      error: error.message 
    })
  }
})

// Get my team for a hackathon (students)
router.get('/:id/my-team', protect, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('teams.memberIds', 'name email')
      .populate('teams.teamLeader', 'name email')

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    // Try to find the team by memberIds (robust to populated or raw ObjectId shapes)
    let myTeam = hackathon.teams.find(team => {
      return team.memberIds && team.memberIds.some(member => {
        try {
          const memberIdStr = member && (member._id ? member._id.toString() : member.toString())
          return memberIdStr === req.user._id.toString()
        } catch (e) {
          return false
        }
      })
    })

    // Fallback: try to find by memberEmails (case-insensitive). This handles cases where
    // teams were created with User ids but the authenticated req.user is an LMSUser (or vice versa)
    if (!myTeam) {
      const userEmail = (req.user && req.user.email) ? req.user.email.toLowerCase() : null
      if (userEmail) {
        myTeam = hackathon.teams.find(team => 
          team.memberEmails && team.memberEmails.some(e => e && e.toLowerCase() === userEmail)
        )
      }
    }

    if (!myTeam) {
      return res.json({
        success: true,
        message: 'Not in a team yet',
        team: null
      })
    }

    console.log('🔍 Sending myTeam with leader:', {
      teamName: myTeam.teamName,
      teamLeader: myTeam.teamLeader,
      memberIds: myTeam.memberIds.map(m => m._id)
    })

    res.json({
      success: true,
      team: myTeam
    })
  } catch (error) {
    console.error('Error fetching team:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch team',
      error: error.message 
    })
  }
})

// Get all teams for a hackathon (globally visible)
router.get('/:id/teams', optionalAuth, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('teams.memberIds', 'name email')
      .populate('teams.teamLeader', 'name email')

    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hackathon not found' 
      })
    }

    // Mark user's team if authenticated
    let teams = hackathon.teams.map(team => {
      const teamObj = team.toObject()
      
      // Ensure memberEmails is included (extract from populated memberIds if not present)
      if (!teamObj.memberEmails || teamObj.memberEmails.length === 0) {
        teamObj.memberEmails = teamObj.memberIds?.map(member => member.email).filter(Boolean) || []
      }
      
      console.log(`🔍 Team "${teamObj.teamName}" memberEmails:`, teamObj.memberEmails)
      
      if (req.user) {
        teamObj.isMyTeam = team.memberIds.some(id => id._id.toString() === req.user._id.toString())
      }
      
      return teamObj
    })

    res.json({
      success: true,
      teams,
      total: teams.length
    })
  } catch (error) {
    console.error('Error fetching teams:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch teams',
      error: error.message 
    })
  }
})

export default router
