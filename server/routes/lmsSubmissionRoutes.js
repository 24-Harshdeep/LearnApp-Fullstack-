import express from 'express'
import LMSSubmission from '../models/LMSSubmission.js'
import LMSAssignment from '../models/LMSAssignment.js'
import LMSClass from '../models/LMSClass.js'
import { verifyToken, isTeacher, isStudent } from '../middleware/lmsAuth.js'
import { updateStudentPoints, calculateTimingBonus } from '../services/pointsEngine.js'

const router = express.Router()

// Submit assignment (Student only)
router.post('/', verifyToken, isStudent, async (req, res) => {
  try {
    const { assignmentId, code, fileUrl } = req.body

    if (!assignmentId || !code) {
      return res.status(400).json({ error: 'Assignment ID and code are required' })
    }

    const assignment = await LMSAssignment.findById(assignmentId).populate('classId')

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    // Check if student is in the class
    if (!assignment.classId.students.includes(req.user._id)) {
      return res.status(403).json({ error: 'You are not enrolled in this class' })
    }

    // Check if already submitted
    const existingSubmission = await LMSSubmission.findOne({
      assignmentId,
      studentId: req.user._id
    })

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.code = code
      existingSubmission.fileUrl = fileUrl
      existingSubmission.submittedAt = new Date()
      existingSubmission.status = 'pending'
      await existingSubmission.save()

      return res.json({
        message: 'Assignment resubmitted successfully',
        submission: existingSubmission
      })
    }

    // Create new submission
    const submission = new LMSSubmission({
      studentId: req.user._id,
      assignmentId,
      code,
      fileUrl
    })

    await submission.save()

    // Add to assignment's submissions array
    assignment.submissions.push(submission._id)
    await assignment.save()

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission
    })
  } catch (error) {
    console.error('Submit assignment error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get submissions for an assignment (Teacher only)
router.get('/assignment/:assignmentId', verifyToken, isTeacher, async (req, res) => {
  try {
    const assignment = await LMSAssignment.findById(req.params.assignmentId).populate('classId')

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    if (assignment.classId.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const submissions = await LMSSubmission.find({ assignmentId: req.params.assignmentId })
      .populate('studentId', 'name email points')
      .sort('-submittedAt')

    res.json(submissions)
  } catch (error) {
    console.error('Get submissions error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get student's own submissions
router.get('/my-submissions', verifyToken, isStudent, async (req, res) => {
  try {
    const submissions = await LMSSubmission.find({ studentId: req.user._id })
      .populate({
        path: 'assignmentId',
        populate: {
          path: 'classId',
          select: 'className'
        }
      })
      .sort('-submittedAt')

    res.json(submissions)
  } catch (error) {
    console.error('Get my submissions error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get single submission
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const submission = await LMSSubmission.findById(req.params.id)
      .populate('studentId', 'name email points')
      .populate({
        path: 'assignmentId',
        populate: {
          path: 'classId',
          populate: {
            path: 'teacherId',
            select: 'name email'
          }
        }
      })

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    // Check access
    const isTeacher = submission.assignmentId.classId.teacherId._id.toString() === req.user._id.toString()
    const isOwner = submission.studentId._id.toString() === req.user._id.toString()

    if (!isTeacher && !isOwner) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(submission)
  } catch (error) {
    console.error('Get submission error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Grade submission (Teacher only)
router.put('/:id/grade', verifyToken, isTeacher, async (req, res) => {
  try {
    const { feedback, points } = req.body

    if (points === undefined) {
      return res.status(400).json({ error: 'Points are required' })
    }

    const submission = await LMSSubmission.findById(req.params.id)
      .populate({
        path: 'assignmentId',
        populate: {
          path: 'classId',
          select: 'teacherId'
        }
      })

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    if (submission.assignmentId.classId.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Update submission
    submission.feedback = feedback || ''
    submission.points = points
    submission.status = 'reviewed'
    submission.reviewedAt = new Date()

    await submission.save()

    // Update student's total points
    await updateStudentPoints(submission.studentId)

    res.json({
      message: 'Submission graded successfully',
      submission
    })
  } catch (error) {
    console.error('Grade submission error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Filter submissions by status
router.get('/assignment/:assignmentId/filter/:status', verifyToken, isTeacher, async (req, res) => {
  try {
    const { assignmentId, status } = req.params

    const assignment = await LMSAssignment.findById(assignmentId).populate('classId')

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    if (assignment.classId.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const submissions = await LMSSubmission.find({ 
      assignmentId,
      status
    })
      .populate('studentId', 'name email points')
      .sort('-submittedAt')

    res.json(submissions)
  } catch (error) {
    console.error('Filter submissions error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
