import express from 'express'
import LMSClass from '../models/LMSClass.js'
import LMSUser from '../models/LMSUser.js'
import LMSAssignment from '../models/LMSAssignment.js'
import LMSSubmission from '../models/LMSSubmission.js'
import { verifyToken, isTeacher, isStudent } from '../middleware/lmsAuth.js'

const router = express.Router()

// Create a new class (Teacher only)
router.post('/', verifyToken, isTeacher, async (req, res) => {
  try {
    const { className, subject, description } = req.body

    if (!className) {
      return res.status(400).json({ error: 'Class name is required' })
    }

    // Generate unique join code
    let joinCode
    let isUnique = false
    
    while (!isUnique) {
      joinCode = LMSClass.generateJoinCode()
      const existing = await LMSClass.findOne({ joinCode })
      if (!existing) isUnique = true
    }

    const newClass = new LMSClass({
      teacherId: req.user._id,
      className,
      subject,
      description,
      joinCode
    })

    await newClass.save()

    // Add class to teacher's classesCreated
    await LMSUser.findByIdAndUpdate(req.user._id, {
      $push: { classesCreated: newClass._id }
    })

    res.status(201).json(newClass)
  } catch (error) {
    console.error('Create class error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all classes for the current user
router.get('/', verifyToken, async (req, res) => {
  try {
    let classes

    if (req.user.role === 'teacher') {
      classes = await LMSClass.find({ teacherId: req.user._id })
        .populate('students', 'name email points')
        .populate('assignments')
        .sort('-createdAt')
    } else {
      classes = await LMSClass.find({ _id: { $in: req.user.classesJoined } })
        .populate('teacherId', 'name email')
        .populate('assignments')
        .sort('-createdAt')
    }

    res.json(classes)
  } catch (error) {
    console.error('Get classes error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get single class details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const classDoc = await LMSClass.findById(req.params.id)
      .populate('teacherId', 'name email')
      .populate('students', 'name email points')
      .populate({
        path: 'assignments',
        populate: {
          path: 'submissions',
          populate: {
            path: 'studentId',
            select: 'name email'
          }
        }
      })

    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' })
    }

    // Check if user has access to this class
    const isTeacher = classDoc.teacherId._id.toString() === req.user._id.toString()
    const isStudent = classDoc.students.some(s => s._id.toString() === req.user._id.toString())

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(classDoc)
  } catch (error) {
    console.error('Get class error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Join a class using code (Student only)
router.post('/join', verifyToken, isStudent, async (req, res) => {
  try {
    const { joinCode } = req.body

    if (!joinCode) {
      return res.status(400).json({ error: 'Join code is required' })
    }

    const classDoc = await LMSClass.findOne({ joinCode: joinCode.toUpperCase() })

    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found. Please check the code.' })
    }

    // Check if already joined
    if (classDoc.students.includes(req.user._id)) {
      return res.status(400).json({ error: 'You have already joined this class' })
    }

    // Add student to class
    classDoc.students.push(req.user._id)
    await classDoc.save()

    // Add class to student's classesJoined
    await LMSUser.findByIdAndUpdate(req.user._id, {
      $push: { classesJoined: classDoc._id }
    })

    res.json({ 
      message: 'Successfully joined class!',
      class: classDoc
    })
  } catch (error) {
    console.error('Join class error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Reset class join code (Teacher only)
router.put('/:id/reset-code', verifyToken, isTeacher, async (req, res) => {
  try {
    const classDoc = await LMSClass.findById(req.params.id)

    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' })
    }

    if (classDoc.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Generate new unique code
    let joinCode
    let isUnique = false
    
    while (!isUnique) {
      joinCode = LMSClass.generateJoinCode()
      const existing = await LMSClass.findOne({ joinCode })
      if (!existing) isUnique = true
    }

    classDoc.joinCode = joinCode
    await classDoc.save()

    res.json({ 
      message: 'Join code reset successfully',
      joinCode: classDoc.joinCode
    })
  } catch (error) {
    console.error('Reset code error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Export class data (Teacher only)
router.get('/:id/export', verifyToken, isTeacher, async (req, res) => {
  try {
    const classDoc = await LMSClass.findById(req.params.id)
      .populate('students', 'name email points')
      .populate({
        path: 'assignments',
        populate: {
          path: 'submissions',
          populate: {
            path: 'studentId',
            select: 'name email'
          }
        }
      })

    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' })
    }

    if (classDoc.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Prepare export data
    const exportData = {
      className: classDoc.className,
      joinCode: classDoc.joinCode,
      totalStudents: classDoc.students.length,
      totalAssignments: classDoc.assignments.length,
      students: classDoc.students.map(student => {
        const submissions = classDoc.assignments.flatMap(a => 
          a.submissions.filter(s => s.studentId._id.toString() === student._id.toString())
        )
        
        return {
          name: student.name,
          email: student.email,
          totalPoints: student.points,
          submissionsCount: submissions.length,
          reviewedCount: submissions.filter(s => s.status === 'reviewed').length,
          averageScore: submissions.length > 0 
            ? (submissions.reduce((sum, s) => sum + s.points, 0) / submissions.length).toFixed(2)
            : 0
        }
      })
    }

    res.json(exportData)
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Rename class (Teacher only)
router.put('/:id/rename', verifyToken, isTeacher, async (req, res) => {
  try {
    const { className } = req.body

    if (!className) {
      return res.status(400).json({ error: 'Class name is required' })
    }

    const classDoc = await LMSClass.findById(req.params.id)

    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' })
    }

    if (classDoc.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    classDoc.className = className
    await classDoc.save()

    res.json({ 
      message: 'Class renamed successfully',
      class: classDoc
    })
  } catch (error) {
    console.error('Rename class error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Remove student from class (Teacher only)
router.delete('/:id/students/:studentId', verifyToken, isTeacher, async (req, res) => {
  try {
    const { id, studentId } = req.params
    
    const classDoc = await LMSClass.findById(id)

    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' })
    }

    if (classDoc.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Remove student from class
    classDoc.students = classDoc.students.filter(s => s.toString() !== studentId)
    await classDoc.save()

    // Remove class from student's classesJoined
    await LMSUser.findByIdAndUpdate(studentId, {
      $pull: { classesJoined: classDoc._id }
    })

    res.json({ message: 'Student removed successfully' })
  } catch (error) {
    console.error('Remove student error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Leave class (Student only)
router.post('/:id/leave', verifyToken, isStudent, async (req, res) => {
  try {
    const classDoc = await LMSClass.findById(req.params.id)

    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' })
    }

    // Check if student is in the class
    if (!classDoc.students.includes(req.user._id)) {
      return res.status(400).json({ error: 'You are not in this class' })
    }

    // Remove student from class
    classDoc.students = classDoc.students.filter(s => s.toString() !== req.user._id.toString())
    await classDoc.save()

    // Remove class from student's classesJoined
    await LMSUser.findByIdAndUpdate(req.user._id, {
      $pull: { classesJoined: classDoc._id }
    })

    res.json({ message: 'Left class successfully' })
  } catch (error) {
    console.error('Leave class error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete class (Teacher only)
router.delete('/:id', verifyToken, isTeacher, async (req, res) => {
  try {
    const classDoc = await LMSClass.findById(req.params.id)

    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' })
    }

    if (classDoc.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Delete all assignments and submissions
    await LMSAssignment.deleteMany({ classId: classDoc._id })
    await LMSSubmission.deleteMany({ assignmentId: { $in: classDoc.assignments } })

    // Remove from students' classesJoined
    await LMSUser.updateMany(
      { _id: { $in: classDoc.students } },
      { $pull: { classesJoined: classDoc._id } }
    )

    // Remove from teacher's classesCreated
    await LMSUser.findByIdAndUpdate(req.user._id, {
      $pull: { classesCreated: classDoc._id }
    })

    await classDoc.deleteOne()

    res.json({ message: 'Class deleted successfully' })
  } catch (error) {
    console.error('Delete class error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
