import express from 'express'
import LMSAssignment from '../models/LMSAssignment.js'
import LMSClass from '../models/LMSClass.js'
import { verifyToken, isTeacher } from '../middleware/lmsAuth.js'

const router = express.Router()

// Create assignment (Teacher only)
router.post('/', verifyToken, isTeacher, async (req, res) => {
  try {
    const { classId, title, description, dueDate, maxPoints } = req.body

    if (!classId || !title || !description || !dueDate) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Verify teacher owns the class
    const classDoc = await LMSClass.findById(classId)
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' })
    }

    if (classDoc.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const assignment = new LMSAssignment({
      classId,
      title,
      description,
      dueDate,
      maxPoints: maxPoints || 100
    })

    await assignment.save()

    // Add to class's assignments array
    classDoc.assignments.push(assignment._id)
    await classDoc.save()

    res.status(201).json(assignment)
  } catch (error) {
    console.error('Create assignment error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get assignments for a class
router.get('/class/:classId', verifyToken, async (req, res) => {
  try {
    const classDoc = await LMSClass.findById(req.params.classId)
    
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' })
    }

    // Check access
    const isTeacher = classDoc.teacherId.toString() === req.user._id.toString()
    const isStudent = classDoc.students.some(s => s.toString() === req.user._id.toString())

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const assignments = await LMSAssignment.find({ classId: req.params.classId })
      .populate({
        path: 'submissions',
        populate: {
          path: 'studentId',
          select: 'name email'
        }
      })
      .sort('-createdAt')

    res.json(assignments)
  } catch (error) {
    console.error('Get assignments error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get single assignment
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const assignment = await LMSAssignment.findById(req.params.id)
      .populate({
        path: 'submissions',
        populate: {
          path: 'studentId',
          select: 'name email points'
        }
      })
      .populate({
        path: 'classId',
        select: 'className teacherId students'
      })

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    // Check access
    const isTeacher = assignment.classId.teacherId.toString() === req.user._id.toString()
    const isStudent = assignment.classId.students.some(s => s.toString() === req.user._id.toString())

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(assignment)
  } catch (error) {
    console.error('Get assignment error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update assignment (Teacher only)
router.put('/:id', verifyToken, isTeacher, async (req, res) => {
  try {
    const assignment = await LMSAssignment.findById(req.params.id).populate('classId')

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    if (assignment.classId.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const { title, description, dueDate, maxPoints } = req.body

    if (title) assignment.title = title
    if (description) assignment.description = description
    if (dueDate) assignment.dueDate = dueDate
    if (maxPoints) assignment.maxPoints = maxPoints

    await assignment.save()

    res.json(assignment)
  } catch (error) {
    console.error('Update assignment error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete assignment (Teacher only)
router.delete('/:id', verifyToken, isTeacher, async (req, res) => {
  try {
    const assignment = await LMSAssignment.findById(req.params.id).populate('classId')

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    if (assignment.classId.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Remove from class's assignments array
    await LMSClass.findByIdAndUpdate(assignment.classId._id, {
      $pull: { assignments: assignment._id }
    })

    await assignment.deleteOne()

    res.json({ message: 'Assignment deleted successfully' })
  } catch (error) {
    console.error('Delete assignment error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
