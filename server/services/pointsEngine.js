import LMSUser from '../models/LMSUser.js'
import LMSSubmission from '../models/LMSSubmission.js'
import LMSClass from '../models/LMSClass.js'

// Calculate and update student points
export const updateStudentPoints = async (studentId) => {
  try {
    // Get all reviewed submissions for the student
    const submissions = await LMSSubmission.find({
      studentId,
      status: 'reviewed'
    })

    // Calculate total points
    const totalPoints = submissions.reduce((sum, sub) => sum + (sub.points || 0), 0)

    // Update user's points
    await LMSUser.findByIdAndUpdate(studentId, { points: totalPoints })

    return totalPoints
  } catch (error) {
    console.error('Error updating student points:', error)
    throw error
  }
}

// Calculate bonus points based on submission timing
export const calculateTimingBonus = (submittedAt, dueDate) => {
  const hoursEarly = (new Date(dueDate) - new Date(submittedAt)) / (1000 * 60 * 60)
  
  if (hoursEarly >= 48) return 10 // 2+ days early
  if (hoursEarly >= 24) return 5  // 1+ day early
  if (hoursEarly >= 0) return 0   // On time
  return -5 // Late submission penalty
}

// Get student rank in class
export const getStudentRank = async (classId, studentId) => {
  try {
    const classDoc = await LMSClass.findById(classId).populate('students', 'points')
    
    if (!classDoc) return null

    // Sort students by points
    const sortedStudents = classDoc.students.sort((a, b) => b.points - a.points)
    
    const rank = sortedStudents.findIndex(s => s._id.toString() === studentId.toString()) + 1
    
    return {
      rank,
      totalStudents: sortedStudents.length,
      topScore: sortedStudents[0]?.points || 0
    }
  } catch (error) {
    console.error('Error calculating rank:', error)
    return null
  }
}
