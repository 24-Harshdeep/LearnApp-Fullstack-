import express from 'express'
import { protect } from '../middleware/lmsAuth.js'
import User from '../models/User.js'
import LMSUser from '../models/LMSUser.js'
import LMSClass from '../models/LMSClass.js'
import LMSSubmission from '../models/LMSSubmission.js'
import LMSAssignment from '../models/LMSAssignment.js'

const router = express.Router()

// Middleware to check if user is a teacher
const isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teachers only.' })
  }
  next()
}

// Get all students (for teacher view)
router.get('/students', protect, isTeacher, async (req, res) => {
  try {
    // Get all students from LMSUser
    const students = await LMSUser.find({ role: 'student' })
      .select('-password')
      .populate('classesJoined', 'name subject')
      .sort({ createdAt: -1 })

    // Also get regular User data for XP and progress
    const enrichedStudents = await Promise.all(students.map(async (student) => {
      const userData = await User.findOne({ email: student.email })
      
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        xp: userData?.xp || 0,
        level: userData?.level || 1,
        streak: userData?.streak?.currentStreak || 0,
        lastActive: userData?.lastActive || student.createdAt,
        progress: userData?.progress || {},
        confidenceIndex: userData?.confidenceIndex || 50,
        classesJoined: student.classesJoined,
        points: student.points
      }
    }))

    res.json({
      success: true,
      students: enrichedStudents,
      total: enrichedStudents.length
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch students',
      error: error.message 
    })
  }
})

// Get students in teacher's classes
router.get('/my-students', protect, isTeacher, async (req, res) => {
  try {
    // Find all classes created by this teacher
    const teacherClasses = await LMSClass.find({ teacher: req.user._id })
      .populate('students', '_id name email points')
    
    // Collect all unique students
    const studentIds = new Set()
    teacherClasses.forEach(cls => {
      cls.students.forEach(student => {
        studentIds.add(student._id.toString())
      })
    })

    // Get detailed info for each student
    const students = await LMSUser.find({ _id: { $in: Array.from(studentIds) } })
      .select('-password')

    // Enrich with User data
    const enrichedStudents = await Promise.all(students.map(async (student) => {
      const userData = await User.findOne({ email: student.email })
      const studentClasses = teacherClasses
        .filter(cls => cls.students.some(s => s._id.toString() === student._id.toString()))
        .map(cls => ({ _id: cls._id, name: cls.name, subject: cls.subject }))
      
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        xp: userData?.xp || 0,
        level: userData?.level || 1,
        streak: userData?.streak?.currentStreak || 0,
        lastActive: userData?.lastActive || student.createdAt,
        progress: userData?.progress || {},
        confidenceIndex: userData?.confidenceIndex || 50,
        classes: studentClasses,
        points: student.points
      }
    }))

    res.json({
      success: true,
      students: enrichedStudents,
      total: enrichedStudents.length
    })
  } catch (error) {
    console.error('Error fetching my students:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch students',
      error: error.message 
    })
  }
})

// Get detailed progress for a specific student
router.get('/student/:id/progress', protect, isTeacher, async (req, res) => {
  try {
    const studentId = req.params.id
    
    // Get LMS User data
    const lmsStudent = await LMSUser.findById(studentId)
      .select('-password')
      .populate('classesJoined', 'name subject teacher')

    if (!lmsStudent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      })
    }

    // Get User data for progress and stats
    const userData = await User.findOne({ email: lmsStudent.email })

    // Get student's submissions
    const submissions = await LMSSubmission.find({ student: studentId })
      .populate('assignment', 'title dueDate')
      .sort({ createdAt: -1 })
      .limit(10)

    // Calculate statistics
    const totalSubmissions = submissions.length
    const gradedSubmissions = submissions.filter(s => s.status === 'graded')
    const averagePoints = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + (s.points || 0), 0) / gradedSubmissions.length
      : 0

    // Weekly progress calculation
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weeklySubmissions = submissions.filter(s => s.createdAt >= oneWeekAgo)

    // Activity timeline (last 5 submissions)
    const activityTimeline = submissions.slice(0, 5).map(s => ({
      type: 'submission',
      title: s.assignment?.title || 'Assignment',
      date: s.createdAt,
      status: s.status,
      points: s.points
    }))

    // Confidence calculation from submission success rate
    const successRate = gradedSubmissions.length > 0
      ? (gradedSubmissions.filter(s => (s.points || 0) >= 70).length / gradedSubmissions.length) * 100
      : 50

    res.json({
      success: true,
      student: {
        _id: lmsStudent._id,
        name: lmsStudent.name,
        email: lmsStudent.email,
        photoURL: lmsStudent.photoURL
      },
      stats: {
        xp: userData?.xp || 0,
        level: userData?.level || 1,
        coins: userData?.coins || 0,
        currentStreak: userData?.streak?.currentStreak || 0,
        longestStreak: userData?.streak?.longestStreak || 0,
        badges: userData?.badges || [],
        rewardsUnlocked: userData?.rewardsUnlocked || []
      },
      progress: userData?.progress || {
        html: 0,
        css: 0,
        javascript: 0,
        react: 0,
        nodejs: 0,
        typescript: 0
      },
      confidenceIndex: successRate,
      submissions: {
        total: totalSubmissions,
        graded: gradedSubmissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        averagePoints: Math.round(averagePoints),
        weeklyCount: weeklySubmissions.length
      },
      weeklyGoalProgress: userData?.weeklyGoalProgress || 0,
      activityTimeline,
      classes: lmsStudent.classesJoined,
      lastActive: userData?.lastActive || lmsStudent.createdAt
    })
  } catch (error) {
    console.error('Error fetching student progress:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch student progress',
      error: error.message 
    })
  }
})

// Award points to a student
router.post('/student/:id/award-points', protect, isTeacher, async (req, res) => {
  try {
    const studentId = req.params.id
    const { points, reason } = req.body

    if (!points || points <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid points amount required' 
      })
    }

    // Update LMS User points
    const lmsStudent = await LMSUser.findByIdAndUpdate(
      studentId,
      { $inc: { points } },
      { new: true }
    )

    if (!lmsStudent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      })
    }

    // Also update User XP
    const userData = await User.findOneAndUpdate(
      { email: lmsStudent.email },
      { $inc: { xp: points } },
      { new: true }
    )

    if (userData) {
      userData.calculateLevel()
      await userData.save()
    }

    res.json({
      success: true,
      message: `Awarded ${points} points to ${lmsStudent.name}`,
      student: {
        _id: lmsStudent._id,
        name: lmsStudent.name,
        points: lmsStudent.points,
        xp: userData?.xp || 0,
        level: userData?.level || 1
      }
    })
  } catch (error) {
    console.error('Error awarding points:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to award points',
      error: error.message 
    })
  }
})

// Get class leaderboard
router.get('/class/:classId/leaderboard', protect, isTeacher, async (req, res) => {
  try {
    const classId = req.params.classId

    const classData = await LMSClass.findById(classId)
      .populate('students', '_id name email points')

    if (!classData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      })
    }

    // Enrich with User XP data
    const leaderboard = await Promise.all(classData.students.map(async (student, index) => {
      const userData = await User.findOne({ email: student.email })
      
      return {
        rank: index + 1,
        _id: student._id,
        name: student.name,
        xp: userData?.xp || 0,
        level: userData?.level || 1,
        streak: userData?.streak?.currentStreak || 0,
        points: student.points,
        badges: userData?.badges?.length || 0
      }
    }))

    // Sort by XP
    leaderboard.sort((a, b) => b.xp - a.xp)
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1
    })

    res.json({
      success: true,
      class: {
        _id: classData._id,
        name: classData.name,
        subject: classData.subject
      },
      leaderboard,
      total: leaderboard.length
    })
  } catch (error) {
    console.error('Error fetching class leaderboard:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch leaderboard',
      error: error.message 
    })
  }
})

export default router
